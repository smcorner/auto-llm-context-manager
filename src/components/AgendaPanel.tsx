import type { AgendaItem } from '../types';

interface AgendaPanelProps {
  agenda: AgendaItem[];
  onToggleStatus: (id: number) => void;
  onRemove: (id: number) => void;
}

const priorityColors = {
  low: 'border-slate-500 bg-slate-500/10',
  medium: 'border-amber-500 bg-amber-500/10',
  high: 'border-red-500 bg-red-500/10',
};

const priorityLabels = {
  low: '🟢 Low',
  medium: '🟡 Medium',
  high: '🔴 High',
};

export function AgendaPanel({ agenda, onToggleStatus, onRemove }: AgendaPanelProps) {
  const pendingTasks = agenda.filter(a => a.status !== 'completed');
  const completedTasks = agenda.filter(a => a.status === 'completed');

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          📋 AI Agenda & Tasks
        </h3>
        <span className="text-sm text-slate-400">
          {pendingTasks.length} pending / {completedTasks.length} completed
        </span>
      </div>

      {agenda.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-3xl mb-2">📝</div>
          <p>No tasks detected yet</p>
          <p className="text-sm">Process conversations to auto-extract tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending Tasks */}
          {pendingTasks.map(item => (
            <div 
              key={item.id}
              className={`border-l-4 rounded-r-lg p-4 ${priorityColors[item.priority]} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-slate-500 hover:border-emerald-500 flex items-center justify-center transition-colors"
                  >
                    {item.status === 'in-progress' && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    )}
                  </button>
                  <div>
                    <p className="text-slate-200">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{priorityLabels[item.priority]}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h4 className="text-sm text-slate-500 mb-2">✅ Completed</h4>
              {completedTasks.slice(-3).map(item => (
                <div 
                  key={item.id}
                  className="flex items-center gap-3 py-2 text-slate-500 line-through"
                >
                  <span className="text-emerald-500">✓</span>
                  <span className="text-sm">{item.task}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
