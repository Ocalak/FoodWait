import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward } from 'lucide-react';

interface IntroOverlayProps {
  onFinish: () => void;
  onSkip: () => void;
}

export default function IntroOverlay({ onFinish, onSkip }: IntroOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
    const onTimeUpdate = () => {
      if (v.duration) setProgress((v.currentTime / v.duration) * 100);
      if (v.currentTime >= 3) setCanSkip(true);
    };
    const onEnded = () => onFinish();
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('ended', onEnded);
    };
  }, [onFinish]);

  return (
    /* Backdrop — blurred, semi-transparent, website visible behind */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onSkip} // click outside to dismiss
    >
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden border-2 border-black"
        style={{
          width: 'min(480px, 90vw)',
          boxShadow: '8px 8px 0 #0A0A0A',
          background: '#000',
        }}
        onClick={e => e.stopPropagation()} // don't close when clicking the card
      >
        {/* Video */}
        <video
          ref={videoRef}
          src="/intro.mp4"
          className="w-full"
          style={{ display: 'block', maxHeight: '60vh', objectFit: 'cover' }}
          playsInline
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 space-y-2">
          {/* Progress bar */}
          <div className="h-0.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">How QBite works</p>
            <AnimatePresence>
              {canSkip && (
                <motion.button
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={onSkip}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  Skip to App <SkipForward className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
