import { motion } from 'framer-motion';
import { Coffee, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EstimateMode = 'quiet' | 'moderate' | 'busy';

interface QuickEstimateToggleProps {
  value: EstimateMode;
  onChange: (mode: EstimateMode) => void;
  className?: string;
}

const MODES = [
  { 
    id: 'quiet' as const, 
    label: 'Quiet', 
    icon: <Coffee className="w-4 h-4" />,
    desc: 'No line, fast service',
    color: 'emerald'
  },
  { 
    id: 'moderate' as const, 
    label: 'Moderate', 
    icon: <Users className="w-4 h-4" />,
    desc: 'Few people ahead',
    color: 'amber'
  },
  { 
    id: 'busy' as const, 
    label: 'Busy', 
    icon: <Zap className="w-4 h-4" />,
    desc: 'Peak rush hour',
    color: 'primary'
  }
];

export default function QuickEstimateToggle({ value, onChange, className }: QuickEstimateToggleProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">
        Current Crowd Level
      </p>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => {
          const isActive = value === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                isActive 
                  ? "border-black bg-white shadow-[3px_3px_0_#0A0A0A] -translate-y-0.5" 
                  : "border-black/5 bg-black/5 hover:border-black/10 hover:bg-black/10 grayscale opacity-60"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                isActive 
                  ? (mode.id === 'busy' 
                      ? "bg-primary text-white" 
                      : mode.id === 'moderate' 
                        ? "bg-amber-100 text-amber-600" 
                        : "bg-emerald-100 text-emerald-600") 
                  : "bg-black/10 text-black/40"
              )}>
                {mode.icon}
              </div>
              <span className={cn(
                "text-xs font-black uppercase tracking-wider mb-0.5",
                isActive ? "text-foreground" : "text-muted"
              )}>
                {mode.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black"
                  style={{ background: mode.id === 'busy' ? 'var(--primary)' : mode.id === 'moderate' ? 'var(--secondary)' : '#10b981' }}
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-center text-muted font-bold uppercase tracking-wider animate-in fade-in duration-500">
        {MODES.find(m => m.id === value)?.desc}
      </p>
    </div>
  );
}
