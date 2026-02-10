import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';

interface CreateTimerProps {
  onStart: (description: string) => void;
}

const CreateTimer: React.FC<CreateTimerProps> = ({ onStart }) => {
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onStart(description);
      setDescription('');
    }
  };

  // Keyboard shortcut: Press "/" to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && document.activeElement !== inputRef.current) {
            e.preventDefault();
            inputRef.current?.focus();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="sticky top-4 z-50 mb-8">
        <form 
            onSubmit={handleSubmit}
            className="bg-card/80 backdrop-blur-md border border-slate-700 p-2 pl-4 rounded-full shadow-2xl flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary"
        >
            <div className="text-slate-400">
                <Icons.Clock className="w-5 h-5" />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="O que você está fazendo? (Pressione '/' para focar)"
                className="bg-transparent border-none outline-none text-white placeholder-slate-400 flex-1 h-10 px-2 text-lg"
                autoFocus
            />
            <button
                type="submit"
                disabled={!description.trim()}
                className="bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 pl-5 pr-6 font-medium flex items-center gap-2 transition-all transform active:scale-95"
            >
                <Icons.Play className="w-5 h-5 fill-current" />
                <span>INICIAR</span>
            </button>
        </form>
    </div>
  );
};

export default CreateTimer;
