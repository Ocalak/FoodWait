import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { MapPin, Clock, Search, Star, Zap, BarChart2 } from 'lucide-react';
import IntroOverlay from '@/components/IntroOverlay';

const ease = [0.16, 1, 0.3, 1] as const;
const BD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Shared fade-up ── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >{children}</motion.div>
  );
}

/* ══════════════════════════════════════════════════
   DEPARTURE BOARD
══════════════════════════════════════════════════ */
const BD = {
  bg:         'linear-gradient(160deg, #0C0C0C 0%, #111111 55%, #0E0E0E 100%)',
  tile:       '#1C1C1C',
  tileBorder: '#2A2A2A',
  tileLine:   '#080808',
  amber:      '#F5A000',
  amberDim:   'rgba(245,160,0,0.4)',
  amberFaint: 'rgba(245,160,0,0.15)',
  amberGlow:  'rgba(245,160,0,0.12)',
  white:      '#F0F0F0',
  divider:    'rgba(255,255,255,0.055)',
  green:      '#52B26B',
  red:        '#E04444',
  mono:       "'Courier New', 'Courier', monospace",
} as const;

function FlapChar({ char, animKey, delay = 0 }: { char: string; animKey: number; delay?: number }) {
  const [displayed, setDisplayed] = useState(char);
  const prevKey = useRef(animKey);

  useEffect(() => {
    if (prevKey.current === animKey) return;
    prevKey.current = animKey;
    const STEPS = 4;
    let step = 0;
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const timer = setTimeout(() => {
      const id = setInterval(() => {
        if (step >= STEPS) { setDisplayed(char); clearInterval(id); }
        else { setDisplayed(char === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]); step++; }
      }, 55);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [animKey, char, delay]);

  if (char === ' ') return <span style={{ display: 'inline-block', width: 9 }} />;

  return (
    <motion.div
      key={`${char}-${animKey}`}
      initial={{ rotateX: -90, opacity: 0.2 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.18, delay, ease: BD_EASE }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 15, height: 23,
        background: BD.tile, border: `1px solid ${BD.tileBorder}`, borderRadius: 3,
        margin: '0 1px', position: 'relative', overflow: 'hidden',
        transformOrigin: 'center top', flexShrink: 0,
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)',
      }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: BD.tileLine, zIndex: 3 }} />
      <span style={{
        fontFamily: BD.mono, fontSize: 12, fontWeight: 700,
        color: BD.white, lineHeight: 1, zIndex: 1,
        textShadow: `0 0 8px rgba(245,160,0,0.4)`,
      }}>
        {displayed === ' ' ? ' ' : displayed}
      </span>
    </motion.div>
  );
}

function FlapText({ text, animKey }: { text: string; animKey: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap', gap: 0 }}>
      {text.split('').map((char, i) => (
        <FlapChar key={i} char={char} animKey={animKey} delay={i * 0.028} />
      ))}
    </div>
  );
}

type DeptStatus = 'ON TIME' | 'DELAYED' | 'BOARDING';
function StatusBadge({ status }: { status: DeptStatus }) {
  const cfg: Record<DeptStatus, { color: string; bg: string; border: string }> = {
    'ON TIME':  { color: BD.green, bg: 'rgba(82,178,107,0.12)',  border: 'rgba(82,178,107,0.32)'  },
    'DELAYED':  { color: BD.red,   bg: 'rgba(224,68,68,0.12)',   border: 'rgba(224,68,68,0.32)'   },
    'BOARDING': { color: BD.amber, bg: 'rgba(245,160,0,0.12)',   border: 'rgba(245,160,0,0.32)'   },
  };
  const c = cfg[status];
  return (
    <motion.span key={status}
      initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: BD_EASE }}
      style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: 3,
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', fontFamily: BD.mono,
        color: c.color, background: c.bg, border: `1px solid ${c.border}`,
        textShadow: `0 0 8px ${c.color}50`, whiteSpace: 'nowrap',
      }}
    >
      {status}
    </motion.span>
  );
}

interface DeptRow {
  key: string; time: string; destination: string;
  city: string; gate: string; wait: number;
  status: DeptStatus; animKey: number;
}

const POOL: Omit<DeptRow, 'key' | 'time' | 'animKey'>[] = [
  { destination: "MUSTAFA'S KEBAP",   city: 'BERLIN',    gate: 'K01', wait: 31, status: 'DELAYED'  },
  { destination: 'DISHOOM',           city: 'LONDON',    gate: 'D02', wait: 12, status: 'ON TIME'  },
  { destination: 'BOUILLON CHARTIER', city: 'PARIS',     gate: 'B03', wait: 26, status: 'DELAYED'  },
  { destination: 'COCOLO RAMEN',      city: 'BERLIN',    gate: 'C04', wait: 14, status: 'ON TIME'  },
  { destination: 'PADELLA',           city: 'LONDON',    gate: 'P05', wait: 17, status: 'BOARDING' },
  { destination: 'CAFE DE FLORE',     city: 'PARIS',     gate: 'C06', wait: 9,  status: 'ON TIME'  },
  { destination: 'ROSCIOLI',          city: 'ROME',      gate: 'R07', wait: 19, status: 'ON TIME'  },
  { destination: 'CURRY 36',          city: 'BERLIN',    gate: 'C08', wait: 7,  status: 'BOARDING' },
  { destination: 'TONNARELLO',        city: 'ROME',      gate: 'T09', wait: 12, status: 'ON TIME'  },
  { destination: 'SOBRINO DE BOTIN',  city: 'MADRID',    gate: 'S10', wait: 21, status: 'DELAYED'  },
  { destination: 'PANCAKE BAKERY',    city: 'AMSTERDAM', gate: 'P11', wait: 16, status: 'ON TIME'  },
  { destination: 'SEPTIME',           city: 'PARIS',     gate: 'S12', wait: 18, status: 'ON TIME'  },
  { destination: 'CASA LUCIO',        city: 'MADRID',    gate: 'C13', wait: 17, status: 'DELAYED'  },
  { destination: 'DE KAS',            city: 'AMSTERDAM', gate: 'D14', wait: 22, status: 'ON TIME'  },
];

function timeFromNow(offsetMinutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function buildInitialRows(): DeptRow[] {
  return POOL.slice(0, 7).map((p, i) => ({
    ...p, key: `row-${p.gate}`, time: timeFromNow(i * 4 + 3), animKey: 0,
  }));
}

function useClock() {
  const fmt = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function DepartureBoard() {
  const clock = useClock();
  const [rows, setRows] = useState<DeptRow[]>(buildInitialRows);
  const [count, setCount] = useState(247);
  const poolIdx = useRef(7);

  useEffect(() => {
    const id = setInterval(() => setCount(c => c + (Math.random() > 0.45 ? 1 : -1)), 3400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRows(prev => {
        const i = Math.floor(Math.random() * prev.length);
        const row = prev[i];
        const all: DeptStatus[] = ['ON TIME', 'DELAYED', 'BOARDING'];
        const next = all.filter(s => s !== row.status)[Math.floor(Math.random() * 2)];
        const newWait = Math.max(2, Math.min(35, row.wait + (Math.random() > 0.5 ? 1 : -1)));
        return prev.map((r, j) => j === i ? { ...r, status: next, wait: newWait, animKey: r.animKey + 1 } : r);
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRows(prev => {
        const ni = poolIdx.current % POOL.length;
        poolIdx.current++;
        const p = POOL[ni];
        const newRow: DeptRow = { ...p, key: `row-${p.gate}-${Date.now()}`, time: timeFromNow(prev.length * 4 + 3), animKey: 0 };
        return [...prev.slice(1), newRow];
      });
    }, 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: BD_EASE }}
      style={{
        background: BD.bg, borderRadius: 16, overflow: 'hidden',
        maxWidth: 720, width: '100%',
        boxShadow: `0 0 0 1px rgba(245,160,0,0.13), 0 2px 4px rgba(0,0,0,0.9), 0 40px 80px rgba(0,0,0,0.65)`,
        position: 'relative',
      }}
    >
      {/* grain */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035, pointerEvents: 'none', zIndex: 0 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 30px', borderBottom: `1px solid ${BD.divider}`, background: 'rgba(0,0,0,0.35)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '4px 10px', border: `2px solid ${BD.amber}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BD.mono, fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: BD.amber, boxShadow: `0 0 14px ${BD.amberGlow}` }}>
            QBI
          </div>
          <div>
            <p style={{ color: BD.amberFaint, fontSize: 9, letterSpacing: '0.2em', fontFamily: BD.mono, textTransform: 'uppercase', marginBottom: 3 }}>Queue Intelligence</p>
            <p style={{ color: BD.amber, fontSize: 22, fontWeight: 700, letterSpacing: '0.14em', fontFamily: BD.mono, textShadow: `0 0 18px ${BD.amberGlow}` }}>Queue Board</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: BD.green, display: 'block', boxShadow: `0 0 7px ${BD.green}` }} />
            <span style={{ color: BD.green, fontSize: 10, fontFamily: BD.mono, fontWeight: 700, letterSpacing: '0.12em' }}>LIVE</span>
          </div>
          <motion.span key={clock} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
            style={{ color: BD.amber, fontSize: 19, fontFamily: BD.mono, fontWeight: 700, letterSpacing: '0.1em', textShadow: `0 0 14px ${BD.amberGlow}` }}
          >{clock}</motion.span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr 56px 100px', gap: 12, padding: '9px 30px', borderBottom: `1px solid ${BD.divider}`, background: 'rgba(0,0,0,0.2)', position: 'relative', zIndex: 1 }}>
        {[{ h: 'TIME', a: 'left' }, { h: 'RESTAURANT', a: 'left' }, { h: 'GATE', a: 'center' }, { h: 'STATUS', a: 'right' }].map(({ h, a }) => (
          <p key={h} style={{ color: BD.amberDim, fontSize: 10, letterSpacing: '0.16em', fontFamily: BD.mono, textAlign: a as 'left' | 'center' | 'right' }}>{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="sync">
          {rows.map((row, i) => (
            <motion.div key={row.key} layout
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.38, ease: BD_EASE }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.022)' }}
              style={{ display: 'grid', gridTemplateColumns: '76px 1fr 56px 100px', gap: 12, padding: '14px 30px', borderBottom: i < rows.length - 1 ? `1px solid ${BD.divider}` : 'none', alignItems: 'center', transition: 'background-color 0.2s' }}
            >
              <span style={{ fontFamily: BD.mono, fontSize: 15, fontWeight: 700, color: BD.amber, letterSpacing: '0.06em', textShadow: `0 0 10px ${BD.amberFaint}` }}>
                {row.time}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ flexShrink: 0 }}>
                  <FlapText text={row.destination} animKey={row.animKey} />
                </div>
                <span style={{ color: BD.amberDim, fontSize: 12, fontFamily: BD.mono, letterSpacing: '0.07em', whiteSpace: 'nowrap', flexShrink: 0, textShadow: `0 0 6px ${BD.amberFaint}` }}>
                  {row.city} · {row.wait}m
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: BD.mono, fontSize: 13, fontWeight: 700, color: 'rgba(240,240,240,0.65)', letterSpacing: '0.05em' }}>{row.gate}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={row.status} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 30px', borderTop: `1px solid ${BD.divider}`, background: 'rgba(245,160,0,0.018)', position: 'relative', zIndex: 1 }}>
        <span style={{ color: BD.amberFaint, fontSize: 9, fontFamily: BD.mono, letterSpacing: '0.12em' }}>UPDATED JUST NOW</span>
        <motion.span key={count} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ color: BD.amberDim, fontSize: 9, fontFamily: BD.mono, letterSpacing: '0.08em' }}
        >{count} QUEUES TRACKED</motion.span>
      </div>
    </motion.div>
  );
}

/* ── Phone mockup ── */
function PhoneMockup() {
  const restaurants = [
    { name: 'Kebab Palace', dist: '0.3 km', wait: 8,  rating: 4.7, bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    { name: 'Tokyo Ramen',  dist: '0.7 km', wait: 14, rating: 4.5, bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
    { name: 'Pizza Roma',   dist: '1.1 km', wait: 22, rating: 4.2, bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
  ];
  return (
    <div style={{ width: 260, height: 530, borderRadius: 40, background: '#0A0A0A', padding: 3, boxShadow: '0 0 0 2px #333, 0 50px 100px rgba(0,0,0,0.5)' }}>
      <div style={{ borderRadius: 37, overflow: 'hidden', height: '100%', background: '#F4F1DE', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700 }}>9:41</span>
          <div style={{ width: 60, height: 14, background: '#0A0A0A', borderRadius: 10 }} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>●●●</span>
        </div>
        <div style={{ padding: '4px 14px 8px', borderBottom: '1.5px solid #0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2 }}>QBITE</span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D42027', boxShadow: '0 0 6px #D42027' }} />
        </div>
        <div style={{ height: 115, background: '#c8d9bf', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <rect width="100%" height="100%" fill="#c8d9bf" />
            <line x1="0" y1="57" x2="260" y2="57" stroke="#b5c9a9" strokeWidth="9" />
            <line x1="130" y1="0" x2="130" y2="115" stroke="#b5c9a9" strokeWidth="6" />
            <rect x="30" y="15" width="35" height="25" rx="3" fill="#d4e6cb" stroke="#b5c9a9" strokeWidth="1" />
            <rect x="160" y="70" width="45" height="30" rx="3" fill="#d4e6cb" stroke="#b5c9a9" strokeWidth="1" />
          </svg>
          {[{x:68,y:44,p:true},{x:128,y:66,p:false},{x:178,y:36,p:false}].map((pt,i)=>(
            <div key={i} style={{ position:'absolute', left:pt.x, top:pt.y, transform:'translate(-50%,-100%)' }}>
              <div style={{ width:14, height:14, background:pt.p?'#D42027':'#EFCA52', border:'1.5px solid #0A0A0A', borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)' }} />
            </div>
          ))}
          <div style={{ position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:10,height:10,background:'#3b82f6',borderRadius:'50%',border:'2px solid white' }} />
          <div style={{ position:'absolute',bottom:5,right:7,background:'rgba(10,10,10,0.7)',color:'#fff',fontSize:7.5,fontWeight:700,padding:'2px 5px',borderRadius:4,textTransform:'uppercase',letterSpacing:1 }}>Live</div>
        </div>
        <div style={{ padding:'7px 10px 5px' }}>
          <div style={{ background:'white',border:'1.5px solid #0A0A0A',borderRadius:8,padding:'5px 8px',display:'flex',alignItems:'center',gap:5 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:'#D42027' }} />
            <span style={{ fontSize:7.5,fontWeight:700,color:'#555',letterSpacing:1 }}>KEBAB · BERLIN</span>
            <div style={{ marginLeft:'auto',fontSize:7.5,background:'#D42027',color:'white',padding:'2px 5px',borderRadius:4,fontWeight:800 }}>GO</div>
          </div>
        </div>
        <div style={{ flex:1,padding:'0 8px 6px',display:'flex',flexDirection:'column',gap:5,overflow:'hidden' }}>
          <div style={{ fontSize:7.5,fontWeight:900,letterSpacing:2,textTransform:'uppercase',color:'#888' }}>3 nearby restaurants</div>
          {restaurants.map((r,i)=>(
            <div key={i} style={{ background:'white',border:'1.5px solid #0A0A0A',borderRadius:10,padding:'6px 8px',display:'flex',alignItems:'center',gap:6,boxShadow:'1.5px 1.5px 0 #0A0A0A' }}>
              <div style={{ width:18,height:18,borderRadius:'50%',background:'#D42027',border:'1.5px solid #0A0A0A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <span style={{ color:'white',fontSize:8,fontWeight:900 }}>{i+1}</span>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:9,fontWeight:900,color:'#0A0A0A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.name}</div>
                <div style={{ fontSize:7,color:'#999',fontWeight:600 }}>{r.dist} · ★ {r.rating}</div>
              </div>
              <div style={{ background:r.bg,border:`1.5px solid ${r.border}`,borderRadius:7,padding:'3px 6px',textAlign:'center',flexShrink:0 }}>
                <div style={{ fontSize:12,fontWeight:900,color:r.text,lineHeight:1 }}>{r.wait}</div>
                <div style={{ fontSize:6,fontWeight:900,color:r.text,textTransform:'uppercase',letterSpacing:0.5 }}>min</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height:20,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ width:56,height:3,background:'#0A0A0A',borderRadius:2,opacity:0.2 }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function Landing() {
  const [, setLocation] = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const launchApp = () => setShowIntro(true);
  const goToApp  = () => { setShowIntro(false); setLocation('/app'); };

  return (
    <div className="overflow-x-hidden" style={{ background: '#FAFAF8' }}>
      <AnimatePresence>
        {showIntro && <IntroOverlay onFinish={goToApp} onSkip={goToApp} />}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="w-full pt-10 md:pt-20 pb-20 overflow-hidden px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: copy */}
          <div className="flex-1 z-10 min-w-0 lg:pr-6">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-black/10 mb-8 bg-white">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Queue Intelligence Active</span>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="font-beb uppercase leading-[0.88] tracking-tight text-black mb-6"
                style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', textShadow: '3px 3px 0 rgba(239,202,82,0.55)' }}>
                SKIP THE<br />
                <span style={{ color: 'var(--primary)' }}>QUEUE.</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-zinc-500 font-semibold text-base md:text-lg leading-relaxed max-w-md mb-8">
                Know your wait time before you leave home. Powered by Markov chain queueing theory — not guesswork.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <motion.button onClick={launchApp}
                whileHover={{ y: -4, boxShadow: '8px 8px 0 #0A0A0A' }}
                whileTap={{ y: 0, boxShadow: '2px 2px 0 #0A0A0A' }}
                transition={{ duration: 0.15 }}
                className="font-beb text-xl md:text-2xl uppercase tracking-widest px-10 py-4 rounded-2xl border-[3px] border-black text-black"
                style={{ background: 'var(--secondary)', boxShadow: '6px 6px 0 #0A0A0A' }}
              >
                Find Food Now →
              </motion.button>
            </FadeUp>
            <FadeUp delay={0.5}>
              <div className="flex gap-8 mt-10 pt-8 border-t-2 border-black/[0.12]">
                {[
                  { v: '3.5h', l: 'Lost per week' },
                  { v: '182h', l: 'Wasted per year' },
                  { v: '37%',  l: 'Leave frustrated' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-beb text-3xl md:text-4xl text-black leading-none"
                      style={{ textShadow: '2px 2px 0 rgba(239,202,82,0.5)' }}>{s.v}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right: departure board */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
            <DepartureBoard />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="w-full border-y-2 border-black overflow-hidden" style={{ background: 'var(--primary)' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap py-3"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="font-beb text-sm uppercase tracking-[0.3em] text-white/80 mx-8">
              Skip The Queue · Find Food Faster · Zero Guesswork · Real-Time Waits ·
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full pt-20 pb-32 px-6 md:px-12 lg:px-20 xl:px-32" style={{ background: '#FAFAF8' }}>
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-3">Simple · Fast · Free</p>
            <h2 className="font-beb text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none text-black">How It Works</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: '01', icon: <Search className="w-5 h-5" />, title: 'Search', body: "Type what you fancy — pizza, kebab, sushi — drop your city or hit GPS. Done in two seconds." },
              { n: '02', icon: <BarChart2 className="w-5 h-5" />, title: 'See Live Waits', body: 'Every nearby spot gets a live queue estimate. See the wait before you leave the house.' },
              { n: '03', icon: <Zap className="w-5 h-5" />, title: 'Eat Smarter', body: "Order online, reserve a table, or walk to the shortest queue — informed every time." },
            ].map((step, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: '6px 6px 0 #0A0A0A' }}
                  transition={{ duration: 0.2, ease }}
                  className="h-full flex flex-col rounded-2xl border-2 border-black bg-white overflow-hidden"
                  style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
                >
                  <div className="h-1.5" style={{ background: 'var(--primary)' }} />
                  <div className="flex flex-col flex-1 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: 'var(--primary)', boxShadow: '2px 2px 0 #0A0A0A' }}>
                        {step.icon}
                      </div>
                      <span className="font-beb text-6xl select-none leading-none" style={{ color: 'rgba(0,0,0,0.07)' }}>{step.n}</span>
                    </div>
                    <h3 className="font-beb text-2xl uppercase tracking-wide mb-3 text-black">{step.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHONE DEMO ── */}
      <section className="relative w-full py-28 px-6 md:px-12 lg:px-20 xl:px-32 border-t-2 border-black" style={{ background: '#0A0A0A' }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,32,39,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-white order-2 lg:order-1">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live on your phone</span>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="font-beb uppercase leading-[0.9] mb-6 text-white" style={{ fontSize: 'clamp(2.5rem,7vw,5.5rem)' }}>
                THE FULL PICTURE<br /><span style={{ color: 'var(--secondary)' }}>IN YOUR HAND.</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-white/50 text-base font-medium leading-relaxed max-w-md mb-10">
                Live map, distance ranking, colour-coded wait times and one-tap ordering — all in one view.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="space-y-4 mb-10">
                {[
                  { icon: <MapPin className="w-4 h-4" />, text: 'Interactive map — all nearby restaurants at a glance' },
                  { icon: <Clock className="w-4 h-4" />,  text: 'Colour-coded wait times, updated in real-time' },
                  { icon: <Star className="w-4 h-4" />,   text: 'Ratings, reviews & one-tap delivery ordering' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0"
                      style={{ color: 'var(--secondary)' }}>{f.icon}</div>
                    <span className="text-white/60 text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <motion.button onClick={launchApp}
                whileHover={{ y: -3, boxShadow: '6px 6px 0 rgba(239,202,82,0.4)' }}
                whileTap={{ y: 0 }} transition={{ duration: 0.15 }}
                className="font-beb text-lg uppercase tracking-widest px-8 py-4 rounded-xl border-[3px] border-black text-black"
                style={{ background: 'var(--secondary)', boxShadow: '4px 4px 0 rgba(239,202,82,0.25)' }}
              >
                Try It Free →
              </motion.button>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="flex-shrink-0 order-1 lg:order-2">
            <motion.div
              initial={{ rotateY: 12, rotateX: 6, opacity: 0 }}
              whileInView={{ rotateY: 0, rotateX: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease }}
              style={{ perspective: 900 }}
            >
              <PhoneMockup />
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full py-28 border-t-2 border-black px-6 md:px-12 lg:px-20 xl:px-32" style={{ background: 'var(--primary)' }}>
        <FadeUp delay={0.1}>
          <h2 className="font-beb uppercase leading-none tracking-wide mb-5 text-white"
            style={{ fontSize: 'clamp(3rem,10vw,7rem)', textShadow: '4px 4px 0 rgba(0,0,0,0.18)' }}>
            Ready to<br />Save Time?
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-white/75 text-base md:text-lg font-medium mb-10 max-w-md">No signup. No download. Just find food faster.</p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <motion.button onClick={launchApp}
            whileHover={{ y: -3, boxShadow: '7px 7px 0 #0A0A0A' }}
            whileTap={{ y: 0, boxShadow: '2px 2px 0 #0A0A0A' }} transition={{ duration: 0.15 }}
            className="font-beb text-xl md:text-2xl uppercase tracking-widest px-10 py-4 rounded-2xl border-[3px] border-black text-black"
            style={{ background: 'var(--secondary)', boxShadow: '5px 5px 0 #0A0A0A' }}
          >
            Launch QBite →
          </motion.button>
        </FadeUp>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-black uppercase tracking-widest">© 2026 QBite · Queue Intelligence Platform</p>
          <div className="flex items-center gap-6">
            {[{ label: 'Privacy Policy', path: '/privacy' }, { label: 'Impressum', path: '/impressum' }, { label: 'Contact', path: '/contact' }].map(link => (
              <Link key={link.path} href={link.path}
                className="text-white/40 hover:text-white/80 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
