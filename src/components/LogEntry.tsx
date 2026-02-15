import { useState } from 'react';
import type { LogEntry as LogEntryType } from '../types';

interface LogEntryProps {
  entry: LogEntryType;
  isLatest: boolean;
}

const typeIcons: Record<string, string> = {
  'memory-access': '🧠',
  'analysis': '🔍',
  'extraction': '📤',
  'thought': '💭',
  'agenda': '📋',
  'output': '✨',
  'insight': '💡',
  'connection': '🔗',
};

const typeColors: Record<string, string> = {
  'memory-access': 'border-blue-500 bg-blue-500/10',
  'analysis': 'border-amber-500 bg-amber-500/10',
  'extraction': 'border-emerald-500 bg-emerald-500/10',
  'thought': 'border-purple-500 bg-purple-500/10',
  'agenda': 'border-orange-500 bg-orange-500/10',
  'output': 'border-green-500 bg-green-500/10',
  'insight': 'border-yellow-500 bg-yellow-500/10',
  'connection': 'border-cyan-500 bg-cyan-500/10',
};

const statusColors: Record<string, string> = {
  'pending': 'text-slate-500',
  'processing': 'text-amber-400 animate-pulse',
  'complete': 'text-emerald-400',
};

export function LogEntryComponent({ entry, isLatest }: LogEntryProps) {
  const [expanded, setExpanded] = useState(isLatest);

  return (
    <div 
      className={`border-l-4 rounded-r-lg p-4 transition-all duration-300 ${typeColors[entry.type]} ${isLatest ? 'scale-100' : 'scale-[0.98] opacity-90'}`}
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Step Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
          {entry.step}
        </div>

        {/* Icon */}
        <span className="text-2xl">{typeIcons[entry.type]}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-100">{entry.title}</h4>
            <span className={`text-xs ${statusColors[entry.status]}`}>
              {entry.status === 'processing' && '● Processing...'}
              {entry.status === 'complete' && '✓ Complete'}
              {entry.status === 'pending' && '○ Pending'}
            </span>
          </div>
          
          <p className="text-slate-400 text-sm mt-1 line-clamp-2">{entry.content}</p>

          {/* Expandable Details */}
          {expanded && entry.details && entry.details.length > 0 && (
            <div className="mt-3 space-y-2 animate-fadeIn">
              {entry.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-300">{detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expand Icon */}
        {entry.details && entry.details.length > 0 && (
          <button className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg 
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Timestamp */}
      <div className="mt-2 text-xs text-slate-600 pl-11">
        {entry.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}
