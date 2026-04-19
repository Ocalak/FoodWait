/**
 * QBite Landing Page — Editorial Minimalism
 * Design: Swiss precision × Monocle editorial × Linear.app product polish
 * Type:   Fraunces (display) + Inter (body)
 * Palette: #FAFAF7 canvas · #C44536 terracotta · #C9A961 ochre · #1A1A1A text
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowUpRight, Search, BarChart2, Zap } from 'lucide-react';
import IntroOverlay from '@/components/IntroOverlay';

// ─── Design tokens ────────────────────────────────────────────
const C = {
  bg:         '#FAFAF7',
  fg:         '#1A1A1A',
  fgMuted:    '#6B6B6B',
  fgSubtle:   '#9B9B9B',
  accent:     '#C44536',   // terracotta — one CTA per viewport
  mustard:    '#C9A961',   // ochre — dots & small accents only
  border:     'rgba(0,0,0,0.08)',
  surface:    '#FFFFFF',
  surfaceDim: 'rgba(0,0,0,0.025)',
  green:      '#5fa870',
} as const;

const F = {
  display: "'Fraunces', Georgia, serif",
  sans:    "'Inter', system-ui, sans-serif",
} as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Scroll-triggered fade-up ──────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Live count that ticks up/down slowly ─────────────────────
function useLiveCount(seed = 247) {
  const [n, setN] = useState(seed);
  useEffect(() => {
    const id = setInterval(
      () => setN(c => c + (Math.random() > 0.45 ? 1 : -1)),
      3400,
    );
    return () => clearInterval(id);
  }, []);
  return n;
}

// ─── Live wait times that tick subtly ─────────────────────────
type WaitRow = { label: string; wait: number };
function useLiveWaits(initial: WaitRow[], cityId: string) {
  const [rows, setRows] = useState(initial);

  // Reset to this city's data whenever the city changes
  useEffect(() => {
    setRows(initial);
  }, [cityId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => {
      setRows(prev =>
        prev.map(r => ({
          ...r,
          wait: Math.max(2, Math.min(35, r.wait + (Math.random() > 0.5 ? 1 : -1))),
        })),
      );
    }, 4200);
    return () => clearInterval(id);
  }, []);
  return rows;
}

// ─── Count-up hook ────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    startTime.current = null;
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setVal(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return val;
}

// ─── Single animated wait bar ─────────────────────────────────
function WaitBar({
  label,
  wait,
  delay = 0,
  last = false,
}: {
  label: string;
  wait: number;
  delay?: number;
  last?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pct = Math.min((wait / 35) * 100, 100);
  const col = wait < 10 ? C.green : wait < 20 ? C.mustard : C.accent;

  return (
    <div
      ref={ref}
      className="flex items-center gap-5 py-3.5"
      style={{ borderBottom: last ? 'none' : `1px solid ${C.border}` }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          style={{ fontFamily: F.sans, color: C.fg, letterSpacing: '-0.01em' }}
        >
          {label}
        </p>
        <div
          className="mt-2 h-px rounded-full overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.07)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: col }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : { width: 0 }}
            transition={{ duration: 1.2, delay: delay + 0.15, ease: EASE }}
          />
        </div>
      </div>
      <motion.div
        key={wait}
        initial={{ opacity: 0.5, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex-shrink-0 text-right"
        style={{ minWidth: 52 }}
      >
        <span
          className="text-2xl tabular-nums"
          style={{
            fontFamily: F.display,
            color:      C.fg,
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          {wait}
        </span>
        <span
          className="text-xs ml-0.5"
          style={{ fontFamily: F.sans, color: C.fgSubtle }}
        >
          min
        </span>
      </motion.div>
    </div>
  );
}

// ─── City data — most visited restaurants per city ────────────
const CITIES = [
  {
    id: 'berlin',
    label: 'Berlin',
    flag: 'DE',
    seed: 247,
    rows: [
      { label: "Mustafa's Kebap · Kreuzberg", wait: 31 }, // legendary queue
      { label: 'Cocolo Ramen · Mitte',        wait: 14 },
      { label: 'Curry 36 · Mehringdamm',      wait: 7  },
    ],
  },
  {
    id: 'paris',
    label: 'Paris',
    flag: 'FR',
    seed: 312,
    rows: [
      { label: 'Bouillon Chartier · 9e',      wait: 26 }, // always a queue outside
      { label: 'Septime · Bastille',           wait: 18 },
      { label: 'Café de Flore · St-Germain',  wait: 9  },
    ],
  },
  {
    id: 'london',
    label: 'London',
    flag: 'GB',
    seed: 198,
    rows: [
      { label: 'Dishoom · Covent Garden',     wait: 29 }, // 1h+ queues daily
      { label: 'Padella · Borough Market',    wait: 17 },
      { label: 'Bao · Soho',                  wait: 11 },
    ],
  },
  {
    id: 'amsterdam',
    label: 'Amsterdam',
    flag: 'NL',
    seed: 183,
    rows: [
      { label: 'Pancake Bakery · Jordaan',    wait: 16 },
      { label: 'Foodhallen · De Hallen',      wait: 8  },
      { label: 'De Kas · Frankendael',        wait: 22 },
    ],
  },
  {
    id: 'madrid',
    label: 'Madrid',
    flag: 'ES',
    seed: 271,
    rows: [
      { label: 'Sobrino de Botín · Sol',      wait: 21 }, // world's oldest restaurant
      { label: 'Mercado San Miguel · Centro', wait: 13 },
      { label: 'Casa Lucio · La Latina',      wait: 17 },
    ],
  },
  {
    id: 'rome',
    label: 'Rome',
    flag: 'IT',
    seed: 224,
    rows: [
      { label: 'Da Enzo al 29 · Trastevere',  wait: 24 },
      { label: 'Roscioli · Campo de\' Fiori', wait: 19 },
      { label: 'Tonnarello · Trastevere',     wait: 12 },
    ],
  },
] as const;

type CityId = typeof CITIES[number]['id'];

// ─── Scrambling number (split-flap effect) ───────────────────
function FlapNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current === value) return;
    prevRef.current = value;
    let step = 0;
    const STEPS = 5;
    const id = setInterval(() => {
      if (step >= STEPS) { setDisplayed(value); clearInterval(id); }
      else { setDisplayed(Math.floor(Math.random() * 35) + 1); step++; }
    }, 38);
    return () => clearInterval(id);
  }, [value]);

  return <>{displayed}</>;
}

// ─── Departure board status ───────────────────────────────────
function boardStatus(wait: number): { label: string; color: string } {
  if (wait < 10) return { label: 'ON TIME',  color: '#5fa870' };
  if (wait < 20) return { label: 'MODERATE', color: '#C9A961' };
  return               { label: 'DELAYED',   color: '#C44536' };
}

// ─── Departure board — hero visual ───────────────────────────
const BOARD = {
  bg:       '#0D0D0D',
  amber:    '#F5A000',
  amberDim: 'rgba(245,160,0,0.35)',
  amberFaint:'rgba(245,160,0,0.15)',
  line:     'rgba(245,160,0,0.10)',
  mono:     "'Courier New', 'Courier', monospace",
};

function DepartureBoard() {
  const [activeCity, setActiveCity] = useState<CityId>('berlin');
  const city  = CITIES.find(c => c.id === activeCity)!;
  const count = useLiveCount(city.seed);
  const rows  = useLiveWaits([...city.rows], city.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
      style={{
        background:   BOARD.bg,
        borderRadius: 12,
        overflow:     'hidden',
        maxWidth:     420,
        width:        '100%',
        boxShadow:    '0 0 0 1px rgba(245,160,0,0.12), 0 32px 64px rgba(0,0,0,0.5)',
        fontFamily:   BOARD.mono,
      }}
    >
      {/* ── Board header ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${BOARD.line}` }}
      >
        <div>
          <p style={{ color: BOARD.amberFaint, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Queue Intelligence
          </p>
          <motion.p
            key={city.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ color: BOARD.amber, fontSize: 13, fontWeight: 700, marginTop: 2, letterSpacing: '0.06em' }}
          >
            {city.label.toUpperCase()} · {city.flag}
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse block"
            style={{ background: '#5fa870' }}
          />
          <span style={{ color: '#5fa870', fontSize: 9, letterSpacing: '0.14em', fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      {/* ── City tabs ── */}
      <div
        className="flex overflow-x-auto gap-1.5 px-4 py-2.5"
        style={{ borderBottom: `1px solid ${BOARD.line}` }}
      >
        {CITIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCity(c.id)}
            className="flex-shrink-0 cursor-pointer transition-all"
            style={{
              padding:       '3px 9px',
              fontSize:      9,
              fontFamily:    BOARD.mono,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background:    activeCity === c.id ? BOARD.amber : 'transparent',
              color:         activeCity === c.id ? BOARD.bg    : BOARD.amberDim,
              border:        activeCity === c.id ? 'none'      : `1px solid ${BOARD.line}`,
              borderRadius:  3,
              fontWeight:    700,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Column headers ── */}
      <div
        className="grid px-5 py-2"
        style={{
          gridTemplateColumns: '1fr 54px 82px',
          gap: 8,
          borderBottom: `1px solid ${BOARD.line}`,
        }}
      >
        {['VENUE', 'WAIT', 'STATUS'].map((h, i) => (
          <p
            key={h}
            style={{
              color:         BOARD.amberFaint,
              fontSize:      8,
              letterSpacing: '0.16em',
              textAlign:     i === 0 ? 'left' : i === 1 ? 'center' : 'right',
            }}
          >
            {h}
          </p>
        ))}
      </div>

      {/* ── Rows ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={city.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {rows.map((r, i) => {
            const [venue, district] = r.label.split(' · ');
            const st = boardStatus(r.wait);
            return (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, rotateX: -70 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.28, delay: i * 0.09, ease: EASE }}
                style={{
                  display:              'grid',
                  gridTemplateColumns:  '1fr 54px 82px',
                  gap:                  8,
                  padding:              '10px 20px',
                  borderBottom:         i < rows.length - 1 ? `1px solid ${BOARD.line}` : 'none',
                  alignItems:           'center',
                  perspective:          600,
                }}
              >
                {/* Venue */}
                <div>
                  <p style={{ color: BOARD.amber, fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', lineHeight: 1.2 }}>
                    {venue}
                  </p>
                  <p style={{ color: BOARD.amberDim, fontSize: 8, letterSpacing: '0.08em', marginTop: 3 }}>
                    {district ?? ''}
                  </p>
                </div>

                {/* Wait */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: BOARD.amber, fontSize: 22, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    <FlapNumber value={r.wait} />
                  </p>
                  <p style={{ color: BOARD.amberFaint, fontSize: 8, letterSpacing: '0.12em', marginTop: 2 }}>MIN</p>
                </div>

                {/* Status */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display:       'inline-block',
                    padding:       '3px 6px',
                    borderRadius:  2,
                    fontSize:      8,
                    fontWeight:    700,
                    letterSpacing: '0.1em',
                    color:         st.color,
                    border:        `1px solid ${st.color}`,
                    background:    `${st.color}18`,
                  }}>
                    {st.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Board footer ── */}
      <div
        className="flex items-center justify-between px-5 py-2.5"
        style={{ borderTop: `1px solid ${BOARD.line}`, background: 'rgba(245,160,0,0.025)' }}
      >
        <span style={{ color: BOARD.amberFaint, fontSize: 8, letterSpacing: '0.12em' }}>
          UPDATED JUST NOW
        </span>
        <motion.span
          key={count}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ color: BOARD.amberDim, fontSize: 8, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}
        >
          {count} QUEUES TRACKED
        </motion.span>
      </div>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ onLaunch }: { onLaunch: () => void }) {
  const count = useLiveCount(247);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background:     'rgba(250,250,247,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom:   `1px solid ${C.border}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10 flex items-center justify-between h-14">
        {/* Wordmark */}
        <span
          className="text-xl font-semibold tracking-tight select-none"
          style={{ fontFamily: F.display, color: C.fg }}
        >
          QBite
        </span>

        {/* Live indicator — desktop only */}
        <div
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.04)',
            border:     `1px solid ${C.border}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse block"
            style={{ background: C.green }}
          />
          <motion.span
            key={count}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-xs tabular-nums"
            style={{ fontFamily: F.sans, color: C.fgMuted }}
          >
            {count} queues tracked right now
          </motion.span>
        </div>

        {/* Primary CTA */}
        <motion.button
          onClick={onLaunch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-medium text-white px-5 py-2 rounded-full cursor-pointer"
          style={{
            fontFamily:  F.sans,
            background:  C.accent,
            letterSpacing: '-0.01em',
          }}
        >
          See live wait times
        </motion.button>
      </div>
    </nav>
  );
}

// ─── Trust band ───────────────────────────────────────────────
function TrustBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const cities = useCountUp(12,    900,  inView);
  const venues = useCountUp(2500,  1100, inView);
  const users  = useCountUp(18400, 1300, inView);

  const items = [
    { val: `${cities}`,                    unit: 'cities live'              },
    { val: `${venues.toLocaleString()}+`,  unit: 'restaurants tracked'      },
    { val: `${users.toLocaleString()}+`,   unit: 'searches this month'      },
    { val: '0',                            unit: 'cookies or signup needed' },
  ];

  return (
    <div
      ref={ref}
      className="max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10 py-10"
      style={{ paddingLeft: '3cm' }}
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
            className="text-center"
          >
            <p
              className="tabular-nums"
              style={{
                fontFamily: F.display,
                fontSize:   'clamp(1.4rem, 2.5vw, 1.75rem)',
                fontWeight: 300,
                color:      C.fg,
                lineHeight: 1,
              }}
            >
              {item.val}
            </p>
            <p
              className="text-xs mt-1.5"
              style={{ fontFamily: F.sans, color: C.fgSubtle }}
            >
              {item.unit}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── How It Works card ────────────────────────────────────────
function StepCard({
  step,
  icon,
  title,
  body,
  delay = 0,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <FadeUp delay={delay}>
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.09)' }}
        transition={{ duration: 0.22, ease: EASE }}
        className="h-full flex flex-col p-8 rounded-2xl cursor-default"
        style={{
          border:     `1px solid ${C.border}`,
          background: C.surface,
          boxShadow:  '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-start justify-between mb-6">
          {/* Icon container */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.05)', color: C.fgMuted }}
          >
            {icon}
          </div>
          {/* Step label */}
          <span
            className="text-xs font-medium tabular-nums"
            style={{ fontFamily: F.sans, color: C.fgSubtle }}
          >
            {step}
          </span>
        </div>
        <h3
          className="text-xl font-semibold mb-3"
          style={{
            fontFamily:    F.display,
            color:         C.fg,
            letterSpacing: '-0.01em',
            lineHeight:    1.2,
          }}
        >
          {title}
        </h3>
        <p
          className="text-[0.9375rem] leading-relaxed"
          style={{ fontFamily: F.sans, color: C.fgMuted, lineHeight: 1.65 }}
        >
          {body}
        </p>
      </motion.div>
    </FadeUp>
  );
}

// ─── Minimal phone mockup ─────────────────────────────────────
function PhoneMockup() {
  const rows = [
    { name: 'Kebab Palace', dist: '0.3 km', wait: 8,  bg: 'rgba(95,168,112,0.1)',  border: 'rgba(95,168,112,0.3)',  text: '#2a6e3a' },
    { name: 'Tokyo Ramen',  dist: '0.7 km', wait: 14, bg: 'rgba(201,169,97,0.12)', border: 'rgba(201,169,97,0.4)',  text: '#7a5e1a' },
    { name: 'Pizza Roma',   dist: '1.1 km', wait: 22, bg: 'rgba(196,69,54,0.08)',  border: 'rgba(196,69,54,0.25)', text: '#8b2a20' },
  ];
  return (
    <div
      style={{
        width: 258, height: 528, borderRadius: 40,
        background: '#111111', padding: 3,
        boxShadow: '0 0 0 1px #2a2a2a, 0 48px 96px rgba(0,0,0,0.55)',
      }}
    >
      <div
        style={{
          borderRadius: 37, overflow: 'hidden', height: '100%',
          background: C.bg, display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Status bar */}
        <div style={{ padding: '10px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 500, fontFamily: F.sans }}>9:41</span>
          <div style={{ width: 56, height: 13, background: '#111', borderRadius: 10 }} />
          <span style={{ fontSize: 9, color: C.fgMuted }}>●●●</span>
        </div>
        {/* Brand row */}
        <div style={{ padding: '3px 14px 8px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, color: C.fg }}>QBite</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'block', boxShadow: `0 0 5px ${C.green}` }} />
        </div>
        {/* Map area */}
        <div style={{ height: 110, background: '#dde8d5', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <rect width="100%" height="100%" fill="#dde8d5" />
            <line x1="0" y1="55" x2="258" y2="55" stroke="#ccd9c2" strokeWidth="7" />
            <line x1="129" y1="0" x2="129" y2="110" stroke="#ccd9c2" strokeWidth="5" />
            <rect x="28" y="13" width="33" height="22" rx="3" fill="#e6f0de" stroke="#ccd9c2" strokeWidth="1" />
            <rect x="160" y="68" width="42" height="26" rx="3" fill="#e6f0de" stroke="#ccd9c2" strokeWidth="1" />
          </svg>
          {[{x:65,y:41,p:true},{x:125,y:62,p:false},{x:174,y:33,p:false}].map((pt, i) => (
            <div key={i} style={{ position: 'absolute', left: pt.x, top: pt.y, transform: 'translate(-50%,-100%)' }}>
              <div style={{ width: 12, height: 12, background: pt.p ? C.accent : C.mustard, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', border: '1px solid rgba(0,0,0,0.12)' }} />
            </div>
          ))}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 9, height: 9, background: '#3b82f6', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 0 3px rgba(59,130,246,0.2)' }} />
          <div style={{ position: 'absolute', bottom: 5, right: 6, background: 'rgba(17,17,17,0.65)', color: '#fff', fontSize: 7, fontWeight: 500, padding: '2px 5px', borderRadius: 3, letterSpacing: 0.5, fontFamily: F.sans }}>Live</div>
        </div>
        {/* Search chip */}
        <div style={{ padding: '6px 10px 4px' }}>
          <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 7, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'block' }} />
            <span style={{ fontSize: 7, fontWeight: 500, color: C.fgMuted, fontFamily: F.sans }}>Kebab · Berlin</span>
            <div style={{ marginLeft: 'auto', fontSize: 7, background: C.accent, color: 'white', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>GO</div>
          </div>
        </div>
        {/* Results */}
        <div style={{ flex: 1, padding: '0 8px 6px', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
          <p style={{ fontSize: 7, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: C.fgSubtle, fontFamily: F.sans }}>3 nearby</p>
          {rows.map((r, i) => (
            <div key={i} style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 7px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontSize: 7, fontWeight: 700 }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 8.5, fontWeight: 600, color: C.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F.sans }}>{r.name}</p>
                <p style={{ fontSize: 6.5, color: C.fgSubtle, fontFamily: F.sans }}>{r.dist}</p>
              </div>
              <div style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 6, padding: '2px 5px', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 300, color: r.text, lineHeight: 1, fontFamily: F.display }}>{r.wait}</p>
                <p style={{ fontSize: 5.5, color: r.text, textTransform: 'uppercase', letterSpacing: 0.3, fontFamily: F.sans }}>min</p>
              </div>
            </div>
          ))}
        </div>
        {/* Home bar */}
        <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 2.5, background: C.fg, borderRadius: 2, opacity: 0.15 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing ─────────────────────────────────────────────
export default function Landing() {
  const [, setLocation] = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const launchApp = () => setShowIntro(true);
  const goToApp   = () => { setShowIntro(false); setLocation('/app'); };
  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }, [email]);

  return (
    <div style={{ background: C.bg, fontFamily: F.sans }}>
      <AnimatePresence>
        {showIntro && <IntroOverlay onFinish={goToApp} onSkip={goToApp} />}
      </AnimatePresence>

      {/* ════════ NAVBAR ════════ */}
      <Navbar onLaunch={launchApp} />

      {/* ════════ HERO ════════ */}
      <section
        className="flex items-center"
        style={{ minHeight: 'calc(100dvh - 56px)' }}
      >
        <div className="w-full max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-16 lg:gap-24 items-center">

          {/* ── Left: copy ── */}
          <div style={{ paddingLeft: '3cm' }}>
            {/* Label pill */}
            <FadeUp>
              <div
                className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full block"
                  style={{ background: C.mustard }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ fontFamily: F.sans, color: C.fgMuted, letterSpacing: '0.02em' }}
                >
                  Queue intelligence for restaurants
                </span>
              </div>
            </FadeUp>

            {/* Display headline */}
            <FadeUp delay={0.04}>
              <h1
                className="mb-6 tracking-tight"
                style={{
                  fontFamily:    F.display,
                  fontSize:      'clamp(2.75rem, 5.5vw, 4.5rem)',
                  color:         C.fg,
                  lineHeight:    1.06,
                  letterSpacing: '-0.025em',
                  fontWeight:    500,
                }}
              >
                Know the wait.
                <br />
                <span style={{ color: C.fgMuted }}>Before you leave.</span>
              </h1>
            </FadeUp>

            {/* Subcopy */}
            <FadeUp delay={0.08}>
              <p
                className="mb-10 max-w-[440px]"
                style={{
                  fontFamily: F.sans,
                  fontSize:   '1.0625rem',
                  color:      C.fgMuted,
                  lineHeight: 1.65,
                }}
              >
                Real-time queue intelligence for 2,500+ restaurants across
                Europe. No guesswork — just data, powered by Markov chain
                simulation.
              </p>
            </FadeUp>

            {/* CTAs */}
            <FadeUp delay={0.12}>
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={launchApp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full cursor-pointer"
                  style={{ fontFamily: F.sans, background: C.accent }}
                >
                  See live wait times <ArrowUpRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={() =>
                    document
                      .getElementById('how-it-works')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full cursor-pointer"
                  style={{
                    fontFamily: F.sans,
                    color:      C.fgMuted,
                    background: 'transparent',
                    border:     `1px solid ${C.border}`,
                  }}
                >
                  Learn how it works
                </motion.button>
              </div>
            </FadeUp>
          </div>

          {/* ── Right: departure board ── */}
          <div className="flex items-center justify-center lg:justify-end">
            <DepartureBoard />
          </div>
        </div>
        </div>
      </section>

      {/* ════════ TRUST BAND ════════ */}
      <div id="trust-band">
        <TrustBand />
      </div>

      {/* ════════ HOW IT WORKS ════════ */}
      <section
        id="how-it-works"
        className="py-24 md:py-36"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10">
          <div style={{ paddingLeft: '3cm' }}>
          <FadeUp className="mb-16">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ fontFamily: F.sans, color: C.fgSubtle, letterSpacing: '0.12em' }}
            >
              How it works
            </p>
            <h2
              className="tracking-tight"
              style={{
                fontFamily:    F.display,
                fontSize:      'clamp(1.75rem, 3vw, 2.5rem)',
                color:         C.fg,
                lineHeight:    1.15,
                letterSpacing: '-0.02em',
                fontWeight:    500,
                maxWidth:      460,
              }}
            >
              From craving to table in three steps.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              step="01"
              icon={<Search className="w-[18px] h-[18px]" />}
              title="Search"
              body="Type what you fancy — pizza, kebab, sushi — then drop a city or tap GPS. Results surface in under a second."
            />
            <StepCard
              step="02"
              delay={0.07}
              icon={<BarChart2 className="w-[18px] h-[18px]" />}
              title="See live wait times"
              body="Every nearby spot gets a live queue estimate. You see the real wait before you leave the house — not after you arrive."
            />
            <StepCard
              step="03"
              delay={0.14}
              icon={<Zap className="w-[18px] h-[18px]" />}
              title="Eat smarter"
              body="Rush hour? Order ahead. Got time? Reserve a table. Or simply walk to the shortest queue — informed, never hoping."
            />
          </div>
          </div>
        </div>
      </section>

      {/* ════════ PHONE DEMO ════════ */}
      <section
        className="py-24 md:py-36 overflow-hidden"
        style={{
          background:  'linear-gradient(155deg, #0f0f0f 0%, #181818 100%)',
          borderTop:   '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">

            {/* Copy */}
            <div className="order-2 lg:order-1" style={{ paddingLeft: '3cm' }}>
              <FadeUp>
                <div
                  className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border:     '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse block"
                    style={{ background: C.green }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ fontFamily: F.sans, color: 'rgba(255,255,255,0.5)' }}
                  >
                    Live on your device
                  </span>
                </div>
              </FadeUp>

              <FadeUp delay={0.05}>
                <h2
                  className="mb-5 tracking-tight"
                  style={{
                    fontFamily:    F.display,
                    fontSize:      'clamp(1.75rem, 3vw, 2.5rem)',
                    color:         '#E8E6E0',
                    lineHeight:    1.15,
                    letterSpacing: '-0.02em',
                    fontWeight:    500,
                  }}
                >
                  The full picture,{' '}
                  <span style={{ color: C.mustard }}>in your hand.</span>
                </h2>
              </FadeUp>

              <FadeUp delay={0.1}>
                <p
                  className="mb-10 max-w-[360px]"
                  style={{
                    fontFamily: F.sans,
                    fontSize:   '1rem',
                    color:      'rgba(232,230,224,0.5)',
                    lineHeight: 1.7,
                  }}
                >
                  Live map, distance ranking, colour-coded wait times and
                  one-tap ordering — all in a single focused view.
                </p>
              </FadeUp>

              <FadeUp delay={0.14}>
                <div className="space-y-5 mb-10">
                  {[
                    {
                      label: 'Interactive map',
                      sub:   'All nearby restaurants plotted and ranked by live wait.',
                    },
                    {
                      label: 'Colour-coded waits',
                      sub:   'Green under 10 min. Amber to 20. Red above — at a glance.',
                    },
                    {
                      label: 'One-tap ordering',
                      sub:   'Jump straight to Lieferando, UberEats, or Deliveroo.',
                    },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 block"
                        style={{ background: C.mustard }}
                      />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ fontFamily: F.sans, color: '#E8E6E0' }}
                        >
                          {f.label}
                        </p>
                        <p
                          className="text-sm mt-0.5"
                          style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.4)' }}
                        >
                          {f.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>

              <FadeUp delay={0.18}>
                <motion.button
                  onClick={launchApp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full cursor-pointer"
                  style={{ fontFamily: F.sans, background: C.accent }}
                >
                  Try it free <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </FadeUp>
            </div>

            {/* Phone */}
            <div className="order-1 lg:order-2 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: EASE }}
              >
                <PhoneMockup />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ background: C.fg, borderTop: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr] gap-12 lg:gap-10" style={{ paddingLeft: '3cm' }}>

          {/* ── Brand + newsletter ── */}
          <div>
            <span
              className="block mb-4 text-xl font-semibold tracking-tight"
              style={{ fontFamily: F.display, color: '#E8E6E0' }}
            >
              QBite
            </span>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{
                fontFamily: F.sans,
                color:      'rgba(232,230,224,0.4)',
                maxWidth:   280,
                lineHeight: 1.65,
              }}
            >
              Real-time queue intelligence for restaurants across Europe.
              Free, forever. No signup required.
            </p>
            {/* Newsletter */}
            <div>
              <p
                className="text-xs font-medium uppercase tracking-widest mb-3"
                style={{
                  fontFamily:    F.sans,
                  color:         'rgba(232,230,224,0.25)',
                  letterSpacing: '0.1em',
                }}
              >
                Stay informed
              </p>
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="flex items-center gap-2 py-2.5"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(95,168,112,0.2)' }}
                    >
                      <span style={{ color: C.green, fontSize: 10, lineHeight: 1 }}>✓</span>
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.5)' }}
                    >
                      You're on the list.
                    </span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubscribe}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 text-sm px-4 py-2.5 rounded-full outline-none min-w-0"
                      style={{
                        fontFamily: F.sans,
                        background: 'rgba(255,255,255,0.06)',
                        border:     '1px solid rgba(255,255,255,0.10)',
                        color:      '#E8E6E0',
                      }}
                      aria-label="Email address for newsletter"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium text-white px-5 py-2.5 rounded-full flex-shrink-0 cursor-pointer"
                      style={{ fontFamily: F.sans, background: C.accent }}
                    >
                      Subscribe
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Product links ── */}
          <nav aria-label="Product navigation">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-5"
              style={{
                fontFamily:    F.sans,
                color:         'rgba(232,230,224,0.25)',
                letterSpacing: '0.1em',
              }}
            >
              Product
            </p>
            <ul className="space-y-3">
              {[
                { label: 'How it works',      href: '#how-it-works' },
                { label: 'Find restaurants',  href: '/app' },
                { label: 'Queue simulation',  href: '#how-it-works' },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-opacity duration-150 hover:opacity-80"
                    style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.45)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Company links ── */}
          <nav aria-label="Company navigation">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-5"
              style={{
                fontFamily:    F.sans,
                color:         'rgba(232,230,224,0.25)',
                letterSpacing: '0.1em',
              }}
            >
              Company
            </p>
            <ul className="space-y-3">
              {[
                { label: 'Contact',        href: '/contact' },
                { label: 'Privacy policy', href: '/privacy' },
                { label: 'Impressum',      href: '/impressum' },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-opacity duration-150 hover:opacity-80"
                    style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.45)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── At-a-glance stats ── */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-5"
              style={{
                fontFamily:    F.sans,
                color:         'rgba(232,230,224,0.25)',
                letterSpacing: '0.1em',
              }}
            >
              Right now
            </p>
            <div className="space-y-5">
              {[
                { n: '2,500+',    l: 'Restaurants tracked'  },
                { n: '< 2 min',   l: 'Average search time'   },
                { n: '0 cookies', l: 'No tracking, ever'     },
              ].map((s, i) => (
                <div key={i}>
                  <p
                    className="tabular-nums"
                    style={{
                      fontFamily: F.display,
                      fontSize:   '1.3rem',
                      fontWeight: 300,
                      color:      '#E8E6E0',
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.3)' }}
                  >
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="max-w-6xl mx-auto px-6 lg:pl-[4cm] lg:pr-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ paddingLeft: '3cm' }}
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p
            className="text-xs"
            style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.22)' }}
          >
            © 2026 QBite. Queue simulation powered by Markov chain theory.
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: F.sans, color: 'rgba(232,230,224,0.18)' }}
          >
            WCAG AA · No cookies · Zero tracking
          </p>
        </div>
      </footer>
    </div>
  );
}
