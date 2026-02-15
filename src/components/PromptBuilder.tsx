import type { ContextMemory } from '../types';

interface PromptBuilderProps {
  memory: ContextMemory;
  isActive: boolean;
}

export function PromptBuilder({ memory, isActive }: PromptBuilderProps) {
  const sections = [
    {
      id: 'memory',
      icon: '🧠',
      title: 'Memory Access',
      description: 'Previous conversations and stored context',
      count: memory.conversations.length,
      color: 'border-blue-500',
      active: memory.conversations.length > 0,
    },
    {
      id: 'projects',
      icon: '📁',
      title: 'Known Projects',
      description: 'Tracked project references',
      count: memory.projects.size,
      color: 'border-emerald-500',
      active: memory.projects.size > 0,
    },
    {
      id: 'tech',
      icon: '💻',
      title: 'Technology Stack',
      description: 'Identified technologies',
      count: memory.technologies.size,
      color: 'border-purple-500',
      active: memory.technologies.size > 0,
    },
    {
      id: 'agenda',
      icon: '📋',
      title: 'Agenda Items',
      description: 'Tasks and action items',
      count: memory.agenda.length,
      color: 'border-orange-500',
      active: memory.agenda.length > 0,
    },
    {
      id: 'insights',
      icon: '💡',
      title: 'AI Insights',
      description: 'Patterns and recommendations',
      count: memory.insights.length,
      color: 'border-yellow-500',
      active: memory.insights.length > 0,
    },
    {
      id: 'input',
      icon: '💬',
      title: 'Current Input',
      description: 'Your latest conversation',
      count: null,
      color: 'border-cyan-500',
      active: isActive,
    },
    {
      id: 'output',
      icon: '✨',
      title: 'Enhanced Output',
      description: 'Generated context prompt',
      count: null,
      color: 'border-pink-500',
      active: isActive,
    },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">🔧 Prompt Structure</h3>
      <div className="space-y-1">
        {sections.map((section) => (
          <div 
            key={section.id}
            className={`flex items-center gap-2 p-2 rounded-lg border-l-2 transition-all ${
              section.active 
                ? `${section.color} bg-slate-700/30` 
                : 'border-slate-700 opacity-50'
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">
                {section.title}
              </div>
            </div>
            {section.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                section.active ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {section.count}
              </span>
            )}
            {section.active && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </div>
        ))}
      </div>
      
      {/* Connection Lines Visual */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          {memory.conversations.length > 0 ? (
            <span className="text-emerald-400">✓ Context ready for processing</span>
          ) : (
            <span>Add conversations to build context</span>
          )}
        </div>
      </div>
    </div>
  );
}
