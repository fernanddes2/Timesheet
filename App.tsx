import React, { useState, useEffect } from 'react';
import { Timer, HistoryItem } from './types';
import CreateTimer from './components/CreateTimer';
import TimerCard from './components/TimerCard';
import HistoryList from './components/HistoryList';
import { generateDailySummary } from './services/geminiService';
import { Icons } from './constants';

const App: React.FC = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Carregar estado do Local Storage ao iniciar
  useEffect(() => {
    const savedTimers = localStorage.getItem('smart-timesheet-timers');
    const savedHistory = localStorage.getItem('smart-timesheet-history');
    if (savedTimers) setTimers(JSON.parse(savedTimers));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Salvar estado no Local Storage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('smart-timesheet-timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('smart-timesheet-history', JSON.stringify(history));
  }, [history]);

  const handleStartTimer = (description: string) => {
    const newTimer: Timer = {
      id: crypto.randomUUID(),
      description,
      startTime: Date.now(),
      accumulatedTime: 0,
      status: 'running',
      createdAt: Date.now()
    };
    setTimers(prev => [newTimer, ...prev]);
  };

  const handlePauseTimer = (id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id && timer.status === 'running') {
        const now = Date.now();
        const currentSegment = timer.startTime ? now - timer.startTime : 0;
        return {
          ...timer,
          status: 'paused',
          startTime: null,
          accumulatedTime: timer.accumulatedTime + currentSegment
        };
      }
      return timer;
    }));
  };

  const handleResumeTimer = (id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id && timer.status !== 'running') {
        return {
          ...timer,
          status: 'running',
          startTime: Date.now()
        };
      }
      return timer;
    }));
  };

  const handleStopTimer = (id: string) => {
    const timerToStop = timers.find(t => t.id === id);
    if (!timerToStop) return;

    let totalDuration = timerToStop.accumulatedTime;
    if (timerToStop.status === 'running' && timerToStop.startTime) {
      totalDuration += Date.now() - timerToStop.startTime;
    }

    const historyItem: HistoryItem = {
      id: timerToStop.id,
      description: timerToStop.description,
      totalDuration,
      completedAt: Date.now()
    };

    setHistory(prev => [historyItem, ...prev]);
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
    setSummary(null);
  }

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setSummary(null);
    const result = await generateDailySummary(history);
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  return (
    <div className="min-h-screen bg-dark pb-20 selection:bg-primary/30 selection:text-primary-100">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 pt-8 sm:pt-12">
        <header className="mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
              Smart Timesheet
            </h1>
            <p className="text-slate-400 mt-2">Gerencie seu tempo com inteligência.</p>
          </div>
          
          {history.length > 0 && (
             <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="mt-4 sm:mt-0 px-4 py-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 text-sm font-medium text-indigo-300 flex items-center gap-2 transition-all disabled:opacity-50"
             >
                {isGeneratingSummary ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Icons.Sparkles className="w-4 h-4" />
                )}
                {isGeneratingSummary ? 'Analisando...' : 'Resumir Dia com IA'}
             </button>
          )}
        </header>

        <CreateTimer onStart={handleStartTimer} />

        <div className="space-y-4">
          {timers.length === 0 && history.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                <div className="inline-flex p-4 rounded-full bg-slate-800/50 text-slate-600 mb-4">
                    <Icons.Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-500">Nenhuma atividade iniciada</h3>
                <p className="text-slate-600">Digite sua tarefa acima para começar a rastrear.</p>
            </div>
          )}

          {timers.map(timer => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onPause={handlePauseTimer}
              onResume={handleResumeTimer}
              onStop={handleStopTimer}
            />
          ))}
        </div>

        {summary && (
            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-indigo-300">
                    <Icons.Sparkles className="w-5 h-5" />
                    <h3 className="font-semibold">Resumo Inteligente</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                      <div dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br />') }} />
                </div>
            </div>
        )}

        <HistoryList history={history} onClear={handleClearHistory} onDelete={handleDeleteHistory} />
      </div>
    </div>
  );
};

export default App;
