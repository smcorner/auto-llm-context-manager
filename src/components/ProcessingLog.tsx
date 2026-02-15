import { useRef, useEffect } from 'react';
import type { LogEntry } from '../types';
import { LogEntryComponent } from './LogEntry';

interface ProcessingLogProps {
  logs: LogEntry[];
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
}

export function ProcessingLog({ logs, isProcessing, currentStep, totalSteps }: ProcessingLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <h3 className="font-mono text-slate-300">AI Processing Log</h3>
          </div>
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              <span className="text-sm font-mono">Step {currentStep}/{totalSteps}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Log Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">🤖</div>
            <p className="font-mono">Waiting for input...</p>
            <p className="text-sm mt-2">Process a conversation to see the AI thinking log</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <LogEntryComponent 
              key={log.id} 
              entry={log} 
              isLatest={index === logs.length - 1}
            />
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
