// ─── Simulation Configuration ──────────────────────────────────────────────────
const CONFIG = {
  ORDER_TIME: 30, // fixed per-order overhead (seconds)
};

// ─── 1. Time-of-Day Markov State ──────────────────────────────────────────────
export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) return { label: "Lunch Peak", multiplier: 1.8, emoji: "☀️", cls: "peak" };
  if (hour >= 18 && hour <= 21) return { label: "Dinner Rush", multiplier: 2.2, emoji: "🌙", cls: "rush" };
  if (hour >= 0 && hour <= 5) return { label: "Closed/Late", multiplier: 0.2, emoji: "😴", cls: "late" };
  return { label: "Normal Flow", multiplier: 1.0, emoji: "🕒", cls: "normal" };
}

// ─── 2. Erlang C Formula ──────────────────────────────────────────────────────
function erlangC(c: number, lambda: number, mu: number) {
  if (lambda <= 0 || mu <= 0 || c < 1) return 0;
  const a = lambda / mu;
  const rho = a / c;
  if (rho >= 1) return 1; // unstable system — always waiting

  let logTerm = 0; // tracks log(a^k / k!) iteratively
  let sumTerms = 1; // k = 0 term
  for (let k = 1; k < c; k++) {
    logTerm += Math.log(a) - Math.log(k);
    sumTerms += Math.exp(logTerm);
  }
  logTerm += Math.log(a) - Math.log(c);
  const cTerm = Math.exp(logTerm) / (1 - rho); // k = c term with geometric series
  return cTerm / (sumTerms + cTerm);
}

// ─── 3. Erlang-k Service Time Sampler ────────────────────────────────────────
function randomErlangK(meanSecs: number, k: number) {
  const rate = k / meanSecs; // each phase has rate k/mean → mean = 1/rate
  let t = 0;
  for (let i = 0; i < k; i++) {
    t += -Math.log(1 - Math.random()) / rate;
  }
  return t;
}

function erlangKPhases(prepMins: number) {
  if (prepMins < 3) return 2;
  if (prepMins < 8) return 3;
  return 5;
}

// ─── 4. Poisson Arrival Sampler ───────────────────────────────────────────────
function poissonSample(lambda: number) {
  if (lambda <= 0) return 0;
  const L = Math.exp(-Math.min(lambda, 700));
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L && k < 200);
  return k - 1;
}

// ─── 5. Main Simulation: M/Ek/c Queue with Balking + Poisson Arrivals ────────
export function simulateWait(queueSize: number, staffCount: number, prepMins: number, arrivalPerMin: number) {
  const SIMS = 1000;
  const tod = getTimeOfDay();
  const k = erlangKPhases(prepMins);
  const meanPrepSecs = prepMins * 60;

  // Effective arrival rate (per second) after time-of-day + balking corrections
  const N_BALK = 20; // queue length at which ~0% of customers join
  const balkFactor = Math.max(0.05, 1 - queueSize / N_BALK);
  const lambdaSec = (arrivalPerMin * tod.multiplier * balkFactor) / 60;

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

    // New arrivals during my queue wait: Poisson(lambda * myQueueWait)
    const newArrivals = poissonSample(lambdaSec * myQueueWait);
    const slipIns = Math.min(newArrivals, staffCount * 4);
    for (let n = 0; n < slipIns; n++) {
      servers.sort();
      const svc = CONFIG.ORDER_TIME + randomErlangK(meanPrepSecs, k);
      servers[0] += svc;
    }

    // My own service
    servers.sort();
    const myService = CONFIG.ORDER_TIME + randomErlangK(meanPrepSecs, k);
    waitTimes[sim] = servers[0] + myService;
  }

  waitTimes.sort();

  const mean = waitTimes.reduce((s, v) => s + v, 0) / SIMS / 60;
  const p10 = waitTimes[Math.floor(SIMS * 0.10)] / 60;
  const p90 = waitTimes[Math.floor(SIMS * 0.90)] / 60;

  // Erlang C system load indicator
  const lambdaMin = arrivalPerMin * tod.multiplier * balkFactor;
  const muMin = 1 / (prepMins + CONFIG.ORDER_TIME / 60);
  const rho = Math.min(lambdaMin / (staffCount * muMin), 1);

  return { 
    mean: Math.round(mean), 
    p10: Math.round(p10), 
    p90: Math.round(p90), 
    tod, 
    rho 
  };
}
