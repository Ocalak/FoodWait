import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { MapPin, Clock, Search, Star, Zap, BarChart2 } from 'lucide-react';
import IntroOverlay from '@/components/IntroOverlay';

const ease = [0.16, 1, 0.3, 1] as const;

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Floating food collage ── */
function FoodCollage() {
  const items = [
    { src: '/pizza_galaxy_1775951547403.png',    x: '5%',   y: '10%',  rotate: -10, delay: 0 },
    { src: '/noodle_nebula_1775951564639.png',   x: '55%',  y: '5%',   rotate: 14,  delay: 0.15 },
    { src: '/kebab_planet_1775951523618.png',    x: '25%',  y: '45%',  rotate: -6,  delay: 0.3 },
  ];
  return (
    <div className="relative w-full aspect-square md:aspect-auto md:h-[560px]">
      {items.map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0.75, rotate: item.rotate - 12 }}
          animate={{ opacity: 1, scale: 1, rotate: item.rotate }}
          transition={{ duration: 1.3, delay: item.delay, ease }}
          whileHover={{ scale: 1.06, rotate: item.rotate * 0.5, transition: { duration: 0.3 } }}
          style={{ 
            position: 'absolute', 
            left: item.x, 
            top: item.y, 
            width: 'clamp(140px, 20vw, 220px)', 
            height: 'clamp(140px, 20vw, 220px)',
            zIndex: i === 2 ? 20 : 10
          }}
        >
          <div className="w-full h-full rounded-full border-[3px] border-black bg-white overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.12)]">
            {item.isVideo
              ? <video src={item.src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              : <img src={item.src} alt="" className="w-full h-full object-cover" />
            }
          </div>
        </motion.div>
      ))}
      {/* Ambient glows */}
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] left-[25%] w-56 h-56 rounded-full -z-10"
        style={{ background: 'radial-gradient(circle, rgba(212,32,39,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[15%] right-[8%] w-72 h-72 rounded-full -z-10"
        style={{ background: 'radial-gradient(circle, rgba(239,202,82,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }} />
    </div>
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
    <div style={{ width: 260, height: 530, borderRadius: 40, background: '#0A0A0A', padding: 3,
      boxShadow: '0 0 0 2px #333, 0 50px 100px rgba(0,0,0,0.5), inset 0 0 0 1px #1a1a1a' }}>
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
            <line x1="0" y1="28" x2="260" y2="90" stroke="#b5c9a9" strokeWidth="4" />
            <rect x="30" y="15" width="35" height="25" rx="3" fill="#d4e6cb" stroke="#b5c9a9" strokeWidth="1" />
            <rect x="160" y="70" width="45" height="30" rx="3" fill="#d4e6cb" stroke="#b5c9a9" strokeWidth="1" />
          </svg>
          {[{x:68,y:44,p:true},{x:128,y:66,p:false},{x:178,y:36,p:false},{x:92,y:82,p:false}].map((pt,i)=>(
            <div key={i} style={{ position:'absolute', left:pt.x, top:pt.y, transform:'translate(-50%,-100%)' }}>
              <div style={{ width:14, height:14, background:pt.p?'#D42027':'#EFCA52', border:'1.5px solid #0A0A0A', borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)' }} />
            </div>
          ))}
          <div style={{ position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:10,height:10,background:'#3b82f6',borderRadius:'50%',border:'2px solid white',boxShadow:'0 0 0 4px rgba(59,130,246,0.25)' }} />
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

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showIntro, setShowIntro] = useState(false);

  const launchApp = () => setShowIntro(true);
  const goToApp = () => { setShowIntro(false); setLocation('/app'); };

  return (
    <div className="overflow-x-hidden" style={{ background: '#FAFAF8' }}>
      <AnimatePresence>
        {showIntro && <IntroOverlay onFinish={goToApp} onSkip={goToApp} />}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="w-full pt-8 md:pt-16 pb-16 overflow-hidden px-4 md:px-8 lg:px-16 xl:px-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

          {/* Left: copy */}
          <div className="flex-1 z-10 lg:pr-8">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-black/10 mb-8 bg-white">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Queue Intelligence Active</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="font-beb uppercase leading-[0.88] tracking-tight text-black mb-6"
                style={{ fontSize: 'clamp(4.5rem,11vw,9.5rem)' }}>
                SKIP THE<br />
                <span style={{ color: 'var(--primary)', WebkitTextStroke: '2px #0A0A0A' }}>QUEUE.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-zinc-500 font-semibold text-base md:text-lg leading-relaxed max-w-md" style={{ marginBottom: '1cm' }}>
                Know your wait time before you leave home. Powered by Markov's chain queueing theory — not guesswork.
              </p>
            </FadeUp>

            <FadeUp delay={0.3} className="mt-[1cm]">
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

            {/* Stats row */}
            <FadeUp delay={0.5}>
              <div className="flex gap-8 pt-10 border-t-2 border-black/8" style={{ marginTop: '1cm', paddingTop: '1cm' }}>
                {[{ v: '3.5h', l: 'Lost per week' }, { v: '182h', l: 'Wasted per year' }, { v: '37%', l: 'Leave frustrated' }].map((s, i) => (
                  <div key={i}>
                    <div className="font-beb text-2xl md:text-3xl text-black leading-none">{s.v}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right: food collage */}
          <div className="flex-1 w-full">
            <FoodCollage />
          </div>
        </div>
      </section>

      {/* ── RED DIVIDER STRIP ── */}
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
      <section className="w-full pt-20 pb-36 px-4 md:px-8 lg:px-16 xl:px-32" style={{ background: '#FAFAF8' }}>
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400 mb-3">Simple · Fast · Free</p>
            <h2 className="font-beb text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none text-black">How It Works</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: '01', icon: <Search className="w-5 h-5" />, title: 'Search', body: "Type what you fancy — pizza, kebab, sushi — and drop your city or just hit GPS. Done in two seconds." },
              { n: '02', icon: <BarChart2 className="w-5 h-5" />, title: 'See Live Wait Times', body: 'We show you every nearby spot with a live queue estimate. No guessing — you see the wait before you leave the house.' },
              { n: '03', icon: <Zap className="w-5 h-5" />, title: 'Eat Smarter', body: "In a rush? Order online instantly. Got time? Reserve a table. Just want to walk in? Head to the shortest queue — stress-free, every time." },
            ].map((step, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: '6px 6px 0 #0A0A0A' }}
                  transition={{ duration: 0.2, ease }}
                  className="h-full flex flex-col rounded-2xl border-2 border-black bg-white overflow-hidden"
                  style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
                >
                  <div className="h-2" style={{ background: 'var(--primary)' }} />
                  <div className="flex flex-col flex-1 p-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 rounded-xl border-2 border-black flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: 'var(--primary)', boxShadow: '2px 2px 0 #0A0A0A' }}>
                        {step.icon}
                      </div>
                      <span className="font-beb text-7xl select-none leading-none" style={{ color: 'rgba(0,0,0,0.06)' }}>{step.n}</span>
                    </div>
                    <h3 className="font-beb text-3xl uppercase tracking-wide mb-3 text-black">{step.title}</h3>
                    <p className="text-zinc-500 text-base font-medium leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHONE DEMO SECTION ── */}
      <section className="relative w-full py-28 px-8 md:px-16 border-t-2 border-black" style={{ background: '#0A0A0A' }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,32,39,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          {/* Copy */}
          <div className="flex-1 text-white order-2 lg:order-1 px-4 md:px-8 lg:px-16 xl:pl-32">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live on your phone</span>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="font-beb uppercase leading-[0.9] mb-6 text-white"
                style={{ fontSize: 'clamp(2.5rem,7vw,5.5rem)' }}>
                THE FULL PICTURE<br />
                <span style={{ color: 'var(--secondary)' }}>IN YOUR HAND.</span>
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-white/45 text-base font-medium leading-relaxed max-w-md mb-10">
                Live map, distance ranking, colour-coded wait times and one-tap ordering — all in one view.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="space-y-4 mb-10">
                {[
                  { icon: <MapPin className="w-4 h-4" />,    text: 'Interactive map — all nearby restaurants at a glance' },
                  { icon: <Clock className="w-4 h-4" />,     text: 'Colour-coded wait times, updated in real-time' },
                  { icon: <Star className="w-4 h-4" />,      text: 'Ratings, reviews & one-tap delivery ordering' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0"
                      style={{ color: 'var(--secondary)' }}>{f.icon}</div>
                    <span className="text-white/60 text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
            <div style={{ marginTop: '1cm' }}>
              <FadeUp delay={0.4}>
                <motion.button onClick={launchApp}
                  whileHover={{ y: -3, boxShadow: '6px 6px 0 rgba(239,202,82,0.3)' }}
                  whileTap={{ y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-beb text-lg uppercase tracking-widest px-8 py-4 rounded-xl border-[3px] border-black text-black"
                  style={{ background: 'var(--secondary)', boxShadow: '4px 4px 0 rgba(239,202,82,0.2)' }}
                >
                  Try It Free →
                </motion.button>
              </FadeUp>
            </div>
          </div>

          {/* Phone */}
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

      {/* ── CTA FOOTER ── */}
      <section className="w-full py-28 border-t-2 border-black px-4 md:px-8 lg:px-16 xl:px-32"
        style={{ background: 'var(--primary)' }}>
        <FadeUp delay={0.1}>
          <h2 className="font-beb uppercase leading-none tracking-wide mb-5 text-white"
            style={{ fontSize: 'clamp(3rem,10vw,7rem)', textShadow: '4px 4px 0 rgba(0,0,0,0.15)' }}>
            Ready to<br />Save Time?
          </h2>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-white/75 text-base md:text-lg font-medium mb-10 max-w-md">
            No signup. No download. Just find food faster.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <motion.button onClick={launchApp}
            whileHover={{ y: -3, boxShadow: '7px 7px 0 #0A0A0A' }}
            whileTap={{ y: 0, boxShadow: '2px 2px 0 #0A0A0A' }}
            transition={{ duration: 0.15 }}
            className="font-beb text-xl md:text-2xl uppercase tracking-widest px-10 py-4 rounded-2xl border-[3px] border-black text-black font-black"
            style={{ background: 'var(--secondary)', boxShadow: '5px 5px 0 #0A0A0A' }}
          >
            Launch QBite →
          </motion.button>
        </FadeUp>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-black uppercase tracking-widest">© 2026 QBite · Queue Intelligence Platform</p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Impressum', path: '/impressum' },
              { label: 'Contact', path: '/contact' },
            ].map(link => (
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
