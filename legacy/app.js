// ─── HTML escape helper (prevents XSS from API data in innerHTML) ─────────────
function esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── Configuration ────────────────────────────────────────────────────────────
const CONFIG = {
    GEOAPIFY_KEY: "df6a689990a246aa93ebc189810ae4a6",
    GEOAPIFY_URL: "https://api.geoapify.com/v2/places",
    NOMINATIM_URL: "https://nominatim.openstreetmap.org/search",
    SEARCH_RADIUS: 3000,
    ORDER_TIME: 30,          // fixed per-order overhead (seconds)
    FETCH_TIMEOUT: 10000,
};

// ─── 1. Time-of-Day Markov State ──────────────────────────────────────────────
// Models the restaurant as a Markov chain over time-of-day states,
// each with a different arrival rate multiplier.
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 11 && hour <= 14) return { label: "Lunch Peak", multiplier: 1.8, emoji: "☀️", cls: "peak" };
    if (hour >= 18 && hour <= 21) return { label: "Dinner Rush", multiplier: 2.2, emoji: "🌙", cls: "rush" };
    if (hour >= 0 && hour <= 5)   return { label: "Closed/Late", multiplier: 0.2, emoji: "😴", cls: "late" };
    return { label: "Normal Flow", multiplier: 1.0, emoji: "🕒", cls: "normal" };
}

// ─── 1b. UI Helpers ────────────────────────────────────────────────────────────

/**
 * Animates a numeric value from start to end over duration.
 */
function animateValue(el, start, end, duration = 400) {
    if (isNaN(start)) start = 0;
    if (isNaN(end)) end = 0;
    
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing: easeOutQuad
        const t = progress;
        const easedProgress = t * (2 - t);
        
        const value = (easedProgress * (end - start) + start).toFixed(1);
        el.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/**
 * Renders a visual row of "people" representing the queue.
 */
function renderQueue(n) {
    const container = document.getElementById("queueVisual");
    if (!container) return;
    
    container.innerHTML = "";
    const maxVisible = 20;
    const count = Math.min(n, maxVisible);

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.className = "queue-person";
        div.style.animationDelay = `${i * 30}ms`;
        container.appendChild(div);
    }
}

// ─── 2. Erlang C Formula ──────────────────────────────────────────────────────
// Exact probability that an arriving customer has to wait in an M/M/c queue.
// Uses log-space arithmetic to stay numerically stable for large c.
//
//         (a^c / c!) · 1/(1−ρ)
// C(c,a) = ─────────────────────────────────────────────
//          Σ_{k=0}^{c-1} a^k/k!  +  (a^c/c!) · 1/(1−ρ)
//
// where a = λ/μ (total offered load in Erlangs), ρ = a/c (server utilisation).
function erlangC(c, lambda, mu) {
    if (lambda <= 0 || mu <= 0 || c < 1) return 0;
    const a   = lambda / mu;
    const rho = a / c;
    if (rho >= 1) return 1;   // unstable system — always waiting

    let logTerm = 0;           // tracks log(a^k / k!) iteratively
    let sumTerms = 1;          // k = 0 term
    for (let k = 1; k < c; k++) {
        logTerm += Math.log(a) - Math.log(k);
        sumTerms += Math.exp(logTerm);
    }
    logTerm += Math.log(a) - Math.log(c);
    const cTerm = Math.exp(logTerm) / (1 - rho);  // k = c term with geometric series
    return cTerm / (sumTerms + cTerm);
}

// ─── 3. Erlang-k Service Time Sampler ────────────────────────────────────────
// Food prep has multiple phases (order → cook → assemble → hand-off).
// The Erlang-k distribution (sum of k exponentials) captures this realistically
// AND preserves the Markov property — unlike the Normal distribution.
// Same mean as before, but variance = mean²/k (tighter for large k).
//
// Number of phases auto-selected from prep complexity:
//   k=2  → quick items (drinks, snacks, <3 min)
//   k=3  → fast food (3–8 min)
//   k=5  → full meals (>8 min)
function randomErlangK(meanSecs, k) {
    const rate = k / meanSecs;   // each phase has rate k/mean → mean = 1/rate
    let t = 0;
    for (let i = 0; i < k; i++) {
        t += -Math.log(1 - Math.random()) / rate;
    }
    return t;
}

function erlangKPhases(prepMins) {
    if (prepMins < 3) return 2;
    if (prepMins < 8) return 3;
    return 5;
}

// ─── 4. Poisson Arrival Sampler ───────────────────────────────────────────────
// Knuth algorithm: exact Poisson(λ) sample in O(λ) time.
function poissonSample(lambda) {
    if (lambda <= 0) return 0;
    const L = Math.exp(-Math.min(lambda, 700));
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L && k < 200);
    return k - 1;
}

// ─── 5. Main Simulation: M/Eₖ/c Queue with Balking + Poisson Arrivals ────────
//
// Improvements over the original Monte Carlo:
//   a) Erlang-k service times (realistic multi-phase prep)
//   b) New customers arrive via Poisson process WHILE you wait
//   c) Balking: P(join queue) decreases as queue grows (self-regulating)
//   d) Time-of-day multiplier scales the effective arrival rate
//   e) Returns P10/P90 percentiles, not just a mean
//
function simulateWait(queueSize, staffCount, prepMins, arrivalPerMin) {
    const SIMS         = 1000;
    const tod          = getTimeOfDay();
    const k            = erlangKPhases(prepMins);
    const meanPrepSecs = prepMins * 60;

    // Effective arrival rate (per second) after time-of-day + balking corrections
    const N_BALK       = 20;    // queue length at which ~0% of customers join
    const balkFactor   = Math.max(0.05, 1 - queueSize / N_BALK);
    const lambdaSec    = (arrivalPerMin * tod.multiplier * balkFactor) / 60;

    const waitTimes = new Float64Array(SIMS);

    for (let sim = 0; sim < SIMS; sim++) {
        const servers = new Float64Array(staffCount); // when each server is next free

        // Drain the existing queue ahead of me (no new arrivals yet)
        for (let q = 0; q < queueSize; q++) {
            servers.sort();
            const svc = CONFIG.ORDER_TIME + randomErlangK(meanPrepSecs, k);
            servers[0] += svc;
        }

        // Estimate when the earliest server will be free for me
        servers.sort();
        const myQueueWait = servers[0]; // seconds until my turn starts

        // New arrivals during my queue wait: Poisson(λ · myQueueWait)
        // They slip into service ahead of me (bounded to prevent explosion)
        const newArrivals = poissonSample(lambdaSec * myQueueWait);
        const slipIns     = Math.min(newArrivals, staffCount * 4);
        for (let n = 0; n < slipIns; n++) {
            servers.sort();
            const svc = CONFIG.ORDER_TIME + randomErlangK(meanPrepSecs, k);
            servers[0] += svc;
        }

        // My own service
        servers.sort();
        const myService  = CONFIG.ORDER_TIME + randomErlangK(meanPrepSecs, k);
        waitTimes[sim]   = servers[0] + myService;
    }

    waitTimes.sort();

    const mean = waitTimes.reduce((s, v) => s + v, 0) / SIMS / 60;
    const p10  = waitTimes[Math.floor(SIMS * 0.10)] / 60;
    const p90  = waitTimes[Math.floor(SIMS * 0.90)] / 60;

    // Erlang C system load indicator (uses per-minute rates)
    const lambdaMin = arrivalPerMin * tod.multiplier * balkFactor;
    const muMin     = 1 / (prepMins + CONFIG.ORDER_TIME / 60);
    const C         = erlangC(staffCount, lambdaMin, muMin);
    const rho       = Math.min(lambdaMin / (staffCount * muMin), 1);

    return { mean, p10, p90, tod, C, rho, k, balkFactor };
}

// ─── Map ──────────────────────────────────────────────────────────────────────
let leafletMap  = null;
let shopMarkers = [];
let userMarker  = null;

function initMap(lat, lon) {
    if (!leafletMap) {
        leafletMap = L.map('map', { zoomControl: true, attributionControl: true })
            .setView([lat, lon], 15);

        const cartoTiles = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        });

        // Fallback to OSM if Carto tiles fail
        cartoTiles.on('tileerror', () => {
            if (leafletMap.hasLayer(cartoTiles)) {
                leafletMap.removeLayer(cartoTiles);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(leafletMap);
            }
        });

        cartoTiles.addTo(leafletMap);
    } else {
        leafletMap.setView([lat, lon], 15);
    }
}

function clearMarkers() {
    shopMarkers.forEach(m => m.remove());
    shopMarkers = [];
    if (userMarker) { userMarker.remove(); userMarker = null; }
}

function addUserMarker(lat, lon) {
    const icon = L.divIcon({
        html: '<div class="user-pin"></div>',
        className: '', iconSize: [16, 16], iconAnchor: [8, 8],
    });
    userMarker = L.marker([lat, lon], { icon, zIndexOffset: 1000 }).addTo(leafletMap);
    userMarker.bindTooltip('You are here', { permanent: false, direction: 'top' });
}

function addShopMarkers(elements, userLat, userLon) {
    clearMarkers();
    addUserMarker(userLat, userLon);

    const bounds = [[userLat, userLon]];
    const sorted = [...elements]
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 30);

    sorted.forEach((el, idx) => {
        if (!el.lat || !el.lon) return;

        const icon = L.divIcon({
            html:       `<div class="shop-pin" style="animation-delay: ${idx * 80}ms"><span>${idx + 1}</span></div>`,
            className:  '',
            iconSize:   [30, 30],
            iconAnchor: [15, 30],
            popupAnchor:[0, -32],
        });

        const marker  = L.marker([el.lat, el.lon], { icon }).addTo(leafletMap);
        const name    = el.name    || 'Unnamed';
        const address = el.address || '';
        const dist    = (el.distance / 1000).toFixed(2);

        marker.bindPopup(`
            <strong style="font-size:0.9rem">${esc(name)}</strong><br>
            <span style="color:#888;font-size:0.8rem">${esc(address)}</span><br>
            <span style="color:#FF4D00;font-weight:700;font-size:0.8rem">${esc(dist)} km away</span>
            <button class="popup-btn" onclick="openModal('${esc(name)}')">
                Calculate Wait Time
            </button>
        `);

        bounds.push([el.lat, el.lon]);
        shopMarkers.push(marker);
    });

    if (bounds.length > 1) leafletMap.fitBounds(bounds, { padding: [40, 40] });
}

function openModal(name) {
    modalShopName.textContent = name;
    overlay.style.display    = 'flex';
    updateCalculation();
    if (leafletMap) leafletMap.closePopup();
}

function showMapAndList(elements, userLat, userLon) {
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded — check CDN or internet connection');
        return;
    }

    const mapEl = document.getElementById('map');
    mapEl.style.display = 'block';

    // Double rAF: browser must process the display:block style change AND
    // complete a paint cycle before Leaflet reads container dimensions.
    // Without this, L.map() measures 0×0 and renders a blank grey box.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            try {
                initMap(userLat, userLon);
                addShopMarkers(elements, userLat, userLon);
                // Extra invalidation after tiles start loading
                setTimeout(() => leafletMap && leafletMap.invalidateSize(), 300);
            } catch (e) {
                console.error('Map init error:', e);
            }
        });
    });
}

// ─── UI Elements ──────────────────────────────────────────────────────────────
const findShopsBtn    = document.getElementById('findShopsBtn');
const searchCityBtn   = document.getElementById('searchCityBtn');
const cityInput       = document.getElementById('cityInput');
const foodInput       = document.getElementById('foodInput');
const resultsSection  = document.getElementById('results');
const statusText      = document.getElementById('status');
const overlay         = document.getElementById('overlay');
const closeModal      = document.getElementById('closeModal');
const queueRange      = document.getElementById('queueRange');
const staffRange      = document.getElementById('staffRange');
const prepRange       = document.getElementById('prepRange');
const arrivalRange    = document.getElementById('arrivalRange');
const queueValueDisp  = document.getElementById('queueValue');
const staffValueDisp  = document.getElementById('staffValue');
const prepValueDisp   = document.getElementById('prepValue');
const arrivalValueDisp= document.getElementById('arrivalValue');
const waitTimeDisplay = document.getElementById('waitTime');
const waitP10Display  = document.getElementById('waitP10');
const waitP90Display  = document.getElementById('waitP90');
const modalShopName   = document.getElementById('modalShopName');
const todBadge        = document.getElementById('todBadge');
const modelLabel      = document.getElementById('modelLabel');
const loadNote        = document.getElementById('loadNote');
const queueVisual     = document.getElementById('queueVisual');
const smartStatus     = document.getElementById('smartStatus');

// State tracking for animations
const uiState = {
    lastWaitTime: 0,
    lastP10: 0,
    lastP90: 0
};

function updateCalculation() {
    const queueSize   = parseInt(queueRange.value);
    const staffCount  = parseInt(staffRange.value);
    const prepMins    = parseInt(prepRange.value);
    const arrivalRate = parseInt(arrivalRange.value);

    queueValueDisp.textContent   = queueSize;
    staffValueDisp.textContent   = staffCount;
    prepValueDisp.innerHTML      = `${prepMins} <em>min</em>`;
    arrivalValueDisp.innerHTML   = `${arrivalRate} <em>/min</em>`;

    const result = simulateWait(queueSize, staffCount, prepMins, arrivalRate);

    // Main wait time with number animation
    animateValue(waitTimeDisplay, uiState.lastWaitTime, result.mean);
    animateValue(waitP10Display,  uiState.lastP10,      result.p10);
    animateValue(waitP90Display,  uiState.lastP90,      result.p90);
    
    uiState.lastWaitTime = result.mean;
    uiState.lastP10      = result.p10;
    uiState.lastP90      = result.p90;

    // Queue Visual storytelling
    renderQueue(queueSize);

    // Bounce animation on result container
    waitTimeDisplay.style.transform = 'scale(1.15)';
    setTimeout(() => (waitTimeDisplay.style.transform = 'scale(1)'), 150);

    // Time-of-day badge (removed from UI, but keep internal state if needed)
    // if (todBadge) {
    //     todBadge.textContent  = `${result.tod.emoji} ${result.tod.label}`;
    //     todBadge.className    = `tod-badge ${result.tod.cls}`;
    // }

    // Smart status label
    let label = "";
    let color = "#22c55e"; // green
    if (result.rho < 0.5) {
        label = "Looks calm";
        color = "var(--green)";
    } else if (result.rho < 0.8) {
        label = "Busy right now";
        color = "var(--secondary)";
    } else {
        label = "High wait likely";
        color = "var(--primary)";
    }
    
    smartStatus.innerHTML = `<div class="dot" style="background:${color}; width:8px; height:8px; border-radius:50%; margin-right:8px; animation: pulse-red 1s infinite;"></div><span>${label}</span>`;
    smartStatus.style.borderColor = color;

    // Model label
    const balkPct = Math.round((1 - result.balkFactor) * 100);
    modelLabel.innerHTML  =
        `Queue model M/E<sub>${result.k}</sub>/c · ${result.k} service phases · walk-away estimate ${balkPct}%`;

    // System load bar (logic only, bar is hidden in current design)
    // const rhoPct = Math.round(result.rho * 100);
    // ...

    loadNote.textContent =
        result.rho >= 1    ? "Very crowded right now — estimates may swing upward quickly." :
        result.rho >= 0.85 ? "High demand window — expect longer lines than usual." :
        result.rho >= 0.6  ? "Moderate rush — plan a little extra time." :
                             "Smooth flow at the moment.";
}

// ─── Network: Geoapify Places API ─────────────────────────────────────────────
async function geoapifySearch(lat, lon, limit = 50) {
    const params = new URLSearchParams({
        categories: "catering",
        filter:     `circle:${lon},${lat},${CONFIG.SEARCH_RADIUS}`,
        limit,
        apiKey:     CONFIG.GEOAPIFY_KEY,
    });

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT);

    try {
        const res = await fetch(`${CONFIG.GEOAPIFY_URL}?${params}`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        return (json.features || [])
            .map(f => ({
                name:     f.properties.name || null,
                address:  f.properties.address_line2 || f.properties.street || f.properties.city || null,
                distance: f.properties.distance || 0,
                lat:      f.geometry?.coordinates[1] || null,
                lon:      f.geometry?.coordinates[0] || null,
            }))
            .filter(p => p.name);
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(e.name === 'AbortError' ? 'Timeout' : e.message);
    }
}

async function fetchNearbyShops(lat, lon) {
    const foodType = (foodInput.value.trim() || 'food').toLowerCase();

    try {
        const all = await geoapifySearch(lat, lon, 100);

        if (foodType !== 'food') {
            const filtered = all.filter(p => p.name.toLowerCase().includes(foodType));
            if (filtered.length > 0) return { ok: true, elements: filtered, fallback: false };

            console.info(`No "${foodType}" found — showing all nearby`);
            return { ok: true, elements: all, fallback: true, foodType };
        }

        return { ok: true, elements: all, fallback: false };
    } catch (err) {
        console.error('Geoapify failed:', err.message);
        return { ok: false, elements: [], error: err.message };
    }
}

// ─── Distance ─────────────────────────────────────────────────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R    = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a    =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function renderShops(elements, userLat, userLon, foodType) {
    if (!elements || elements.length === 0) {
        resultsSection.innerHTML = `<p class="status-text">No ${foodType} places found in this area.</p>`;
        document.getElementById('map').style.display = 'none';
        return;
    }

    resultsSection.innerHTML = '';

    const sorted = elements
        .map(el => ({ el, dist: parseFloat((el.distance / 1000).toFixed(2)) }))
        .sort((a, b) => a.dist - b.dist);

    // Fade out skeletons
    const skeletons = resultsSection.querySelectorAll('.skeleton');
    skeletons.forEach(s => s.style.opacity = '0');
    
    setTimeout(() => {
        resultsSection.innerHTML = '';
        sorted.forEach(({ el, dist }, idx) => {
            const name    = el.name || `Unnamed ${foodType} spot`;
            const address = el.address || 'Nearby';
            const card    = document.createElement('button');
            card.className = 'shop-card fade-up';
            card.setAttribute('type', 'button');
            card.style.animationDelay = `${idx * 50}ms`;
            card.innerHTML = `
                <div class="shop-info">
                    <h3>${esc(name)}</h3>
                    <p>${esc(address)}</p>
                </div>
                <div class="shop-meta">
                    <div class="distance">${esc(String(dist))} km</div>
                </div>`;
            card.addEventListener('click', () => {
                if (el.lat && el.lon && leafletMap) {
                    leafletMap.setView([el.lat, el.lon], 17);
                    const marker = shopMarkers[idx];
                    if (marker) marker.openPopup();
                    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                openModal(name);
            });
            resultsSection.appendChild(card);
        });
    }, 300);

    showMapAndList(elements, userLat, userLon);
}

// ─── Error fallback ───────────────────────────────────────────────────────────
function showApiError(lat, lon, foodType, errorMsg) {
    statusText.style.display = 'block';
    statusText.innerHTML = `
        <div style="color:#ffaa00;margin-bottom:0.8rem">⚠️ Could not reach map server (${errorMsg}).</div>
        <button id="useMockBtn" class="btn" style="padding:0.6rem 1rem;font-size:0.85rem;background:#333">
            Show Demo Results Instead
        </button>`;
    resultsSection.innerHTML = '';

    document.getElementById('useMockBtn').addEventListener('click', () => {
        const mockShops = [
            { name: `Demo: Best ${foodType} Palace`, address: 'Alexanderplatz 1',    distance: 250 },
            { name: `Demo: ${foodType} Express`,     address: 'Torstraße 45',         distance: 420 },
            { name: `Demo: Golden ${foodType}`,      address: 'Karl-Marx-Allee 12',   distance: 610 },
            { name: `Demo: ${foodType} Haus`,        address: 'Oranienburger Str 8',  distance: 780 },
        ];
        renderShops(mockShops, lat, lon, foodType);
        statusText.style.display = 'none';
    });
}

// ─── Main search flow ─────────────────────────────────────────────────────────
async function runSearch(lat, lon) {
    const foodType = foodInput.value.trim() || 'food';

    statusText.style.display = 'block';
    statusText.textContent   = `Scanning for ${foodType} near you…`;
    resultsSection.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';

    const result = await fetchNearbyShops(lat, lon);

    if (result.ok) {
        renderShops(result.elements, lat, lon, result.fallback ? 'restaurant' : foodType);
        if (result.fallback) {
            statusText.style.display = 'block';
            statusText.innerHTML = `<span style="color:#ffaa00">No "${result.foodType}" places found nearby — showing all restaurants instead.</span>`;
        } else {
            statusText.style.display = 'none';
        }
    } else {
        showApiError(lat, lon, foodType, result.error);
    }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
findShopsBtn.addEventListener('click', () => {
    statusText.style.display = 'block';
    statusText.textContent   = 'Requesting location…';
    resultsSection.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';

    navigator.geolocation.getCurrentPosition(
        (pos) => runSearch(pos.coords.latitude, pos.coords.longitude),
        (err) => {
            console.warn('Geolocation error:', err.message);
            statusText.style.display = 'block';
            statusText.innerHTML = `
                <div style="color:#ffaa00;margin-bottom:0.8rem">📍 Location unavailable: ${err.message}</div>
                <div style="color:var(--text-dim);font-size:0.85rem">Use the city search below instead.</div>`;
            resultsSection.innerHTML = '';
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
});

searchCityBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (!city) {
        statusText.style.display = 'block';
        statusText.textContent   = 'Please enter a city name.';
        return;
    }

    statusText.style.display = 'block';
    statusText.textContent   = `Geocoding "${city}"…`;
    resultsSection.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';

    try {
        const res  = await fetch(`${CONFIG.NOMINATIM_URL}?format=json&q=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            await runSearch(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } else {
            statusText.textContent   = `Could not find "${city}". Try a different spelling.`;
            resultsSection.innerHTML = '';
        }
    } catch (e) {
        console.error('Nominatim error:', e);
        statusText.textContent   = 'Geocoding service error. Try again.';
        resultsSection.innerHTML = '';
    }
});

cityInput.addEventListener('keypress',  (e) => { if (e.key === 'Enter') searchCityBtn.click(); });
foodInput.addEventListener('keypress',  (e) => { if (e.key === 'Enter') searchCityBtn.click(); });


function dismissModal() {
    overlay.style.animation = 'fadeOut 0.2s forwards';
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.animation = '';
    }, 200);
}

closeModal.addEventListener('click', dismissModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) dismissModal(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.style.display !== 'none') dismissModal(); });

// Slider bounce feedback
[queueRange, staffRange, prepRange, arrivalRange].forEach(range => {
    range.addEventListener('input', (e) => {
        const valEl = e.target.parentElement.querySelector('.slider-val');
        if (valEl) {
            valEl.style.transform = 'scale(1.2)';
            setTimeout(() => valEl.style.transform = 'scale(1)', 100);
        }
        updateCalculation();
    });
});
