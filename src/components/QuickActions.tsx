interface QuickActionsProps {
  onLoadSample: () => void;
  onProcess: () => void;
  onClear: () => void;
  isProcessing: boolean;
  hasInput: boolean;
}

export function QuickActions({ 
  onLoadSample, 
  onProcess, 
  onClear, 
  isProcessing, 
  hasInput 
}: QuickActionsProps) {
  const actions = [
    {
      icon: '📋',
      label: 'Load Sample',
      description: 'Load example conversation',
      onClick: onLoadSample,
      color: 'bg-violet-600 hover:bg-violet-500',
      disabled: false,
    },
    {
      icon: '🚀',
      label: 'Process',
      description: 'Analyze with AI',
      onClick: onProcess,
      color: 'bg-emerald-600 hover:bg-emerald-500',
      disabled: !hasInput || isProcessing,
    },
    {
      icon: '🗑️',
      label: 'Clear All',
      description: 'Reset memory',
      onClick: onClear,
      color: 'bg-red-600 hover:bg-red-500',
      disabled: false,
    },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">⚡ Quick Actions</h3>
      <div className="flex flex-col gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${action.color} ${
              action.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-xl">{action.icon}</span>
            <div className="text-left">
              <div className="font-semibold text-white text-sm">{action.label}</div>
              <div className="text-xs text-white/70">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
