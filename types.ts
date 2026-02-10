export type TimerStatus = 'running' | 'paused' | 'stopped';

export interface Timer {
  id: string;
  description: string;
  startTime: number | null; // Timestamp when current segment started
  accumulatedTime: number; // Total ms before current segment
  status: TimerStatus;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  description: string;
  totalDuration: number;
  completedAt: number;
}

export interface AISummary {
  summary: string;
  suggestions: string[];
}
