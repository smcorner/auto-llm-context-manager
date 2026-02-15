import type { StoredConversation, AIInsight } from '../types';

interface TimelineViewProps {
  conversations: StoredConversation[];
  insights: AIInsight[];
}

interface TimelineItem {
  id: number;
  type: 'conversation' | 'insight';
  timestamp: string;
  title: string;
  content: string;
  tags?: string[];
}

export function TimelineView({ conversations, insights }: TimelineViewProps) {
  // Merge and sort all items by timestamp
  const items: TimelineItem[] = [
    ...conversations.map(c => ({
      id: c.id,
      type: 'conversation' as const,
      timestamp: c.timestamp,
      title: 'Conversation',
      content: c.user.substring(0, 100) + (c.user.length > 100 ? '...' : ''),
      tags: [...c.extracted.projects.slice(0, 2), ...c.extracted.technologies.slice(0, 2)],
    })),
    ...insights.map(i => ({
      id: i.id,
      type: 'insight' as const,
      timestamp: i.timestamp,
      title: i.type.charAt(0).toUpperCase() + i.type.slice(1),
      content: i.content,
      tags: i.relatedTo,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIcon = (type: string, title: string) => {
    if (type === 'conversation') return '💬';
    switch (title.toLowerCase()) {
      case 'observation': return '👁️';
      case 'recommendation': return '💡';
      case 'warning': return '⚠️';
      case 'connection': return '🔗';
      default: return '📌';
    }
  };

  const getColor = (type: string, title: string) => {
    if (type === 'conversation') return 'border-violet-500 bg-violet-500/10';
    switch (title.toLowerCase()) {
      case 'observation': return 'border-blue-500 bg-blue-500/10';
      case 'recommendation': return 'border-yellow-500 bg-yellow-500/10';
      case 'warning': return 'border-red-500 bg-red-500/10';
      case 'connection': return 'border-cyan-500 bg-cyan-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
        📅 Activity Timeline
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <div className="text-4xl mb-4">📅</div>
          <p>No activity yet</p>
          <p className="text-sm mt-2">Process conversations to see your timeline</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700"></div>

          <div className="space-y-4">
            {items.slice(0, 10).map((item, idx) => (
              <div 
                key={`${item.type}-${item.id}`}
                className="relative pl-14 animate-fadeIn"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                </div>

                {/* Content card */}
                <div className={`border-l-4 rounded-r-lg p-4 ${getColor(item.type, item.title)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getIcon(item.type, item.title)}</span>
                      <span className="font-semibold text-slate-200">{item.title}</span>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-slate-400">{item.content}</p>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 4).map((tag, tagIdx) => (
                        <span 
                          key={tagIdx} 
                          className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {items.length > 10 && (
            <div className="text-center mt-4 text-slate-500 text-sm">
              +{items.length - 10} more items
            </div>
          )}
        </div>
      )}
    </div>
  );
}
