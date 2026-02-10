import React from 'react';
import { HistoryItem } from '../types';
import { formatDuration } from '../utils/timeUtils';
import { Icons } from '../constants';

interface HistoryListProps {
  history: HistoryItem[];
  onClear: () => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onClear, onDelete }) => {
  if (history.length === 0) return null;

  // Ordenar histórico por data (mais recente primeiro)
  const sortedHistory = [...history].sort((a, b) => b.completedAt - a.completedAt);

  // Agrupar itens por data
  const groupedHistory: { label: string; items: HistoryItem[] }[] = [];

  sortedHistory.forEach((item) => {
    const date = new Date(item.completedAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Verifica se é Hoje ou Ontem
    if (date.toDateString() === today.toDateString()) {
      label = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Ontem';
    }

    const lastGroup = groupedHistory[groupedHistory.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(item);
    } else {
      groupedHistory.push({ label, items: [item] });
    }
  });

  const handleConfirmClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
      onClear();
    }
  };

  const handleConfirmDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
      onDelete(id);
    }
  };

  return (
    <div className="mt-12 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-200">Histórico</h2>
        <button 
            onClick={handleConfirmClear}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 hover:border-red-500/30"
        >
            Limpar tudo
        </button>
      </div>
      
      <div className="space-y-8">
        {groupedHistory.map((group) => (
          <div key={group.label} className="animate-slide-up">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
              {group.label}
            </h3>
            <div className="bg-card rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
              {group.items.map((item, index) => (
                <div 
                  key={item.id}
                  className={`
                      flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors group
                      ${index !== group.items.length - 1 ? 'border-b border-slate-700/50' : ''}
                  `}
                >
                  <div className="min-w-0 flex-1 pr-4">
                      <p className="text-slate-300 font-medium truncate">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-400 font-semibold bg-slate-800/50 px-2 py-1 rounded text-sm">
                          {formatDuration(item.totalDuration)}
                      </span>
                      <button 
                          onClick={() => handleConfirmDelete(item.id)}
                          className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-slate-700"
                          title="Excluir entrada"
                      >
                          <Icons.Trash className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;