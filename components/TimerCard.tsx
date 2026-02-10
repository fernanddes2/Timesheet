import React, { useState, useEffect } from 'react';
import { Timer } from '../types';
import { Icons } from '../constants';
import { formatDuration } from '../utils/timeUtils';

interface TimerCardProps {
  timer: Timer;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
}

const TimerCard: React.FC<TimerCardProps> = ({ timer, onPause, onResume, onStop }) => {
  const [displayTime, setDisplayTime] = useState(timer.accumulatedTime);

  useEffect(() => {
    let interval: number | undefined;

    if (timer.status === 'running') {
      // Immediate update to avoid lag perception
      const update = () => {
        const now = Date.now();
        const currentSegment = timer.startTime ? now - timer.startTime : 0;
        setDisplayTime(timer.accumulatedTime + currentSegment);
      };
      
      update();
      interval = window.setInterval(update, 100); // 100ms for smooth updates
    } else {
      setDisplayTime(timer.accumulatedTime);
    }

    return () => clearInterval(interval);
  }, [timer.status, timer.startTime, timer.accumulatedTime]);

  const isRunning = timer.status === 'running';

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 transition-all duration-300
      ${isRunning 
        ? 'bg-card border-l-4 border-l-primary shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
        : 'bg-card/50 border border-slate-700 opacity-90 hover:opacity-100'}
    `}>
      {/* Background Glow for running state */}
      {isRunning && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate pr-2" title={timer.description}>
            {timer.description || 'Sem descrição'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`}></div>
             <span className="text-xs uppercase tracking-wider font-medium text-slate-400">
               {isRunning ? 'Em andamento' : 'Pausado'}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className={`text-4xl font-mono font-bold tracking-tight tabular-nums
            ${isRunning ? 'text-white' : 'text-slate-400'}
          `}>
            {formatDuration(displayTime)}
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={() => onPause(timer.id)}
                className="p-3 rounded-full bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors border border-yellow-500/20"
                title="Pausar"
              >
                <Icons.Pause className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => onResume(timer.id)}
                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                title="Retomar"
              >
                <Icons.Play className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={() => onStop(timer.id)}
              className="p-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
              title="Finalizar"
            >
              <Icons.Stop className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerCard;
