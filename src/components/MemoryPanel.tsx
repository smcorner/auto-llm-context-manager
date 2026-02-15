import type { ContextMemory, StoredConversation } from '../types';

interface MemoryPanelProps {
  memory: ContextMemory;
  onSelectConversation: (conv: StoredConversation) => void;
}

export function MemoryPanel({ memory, onSelectConversation }: MemoryPanelProps) {
  const recentConversations = [...memory.conversations].reverse().slice(0, 5);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
        🧠 Memory Bank
      </h3>

      {/* Memory Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{memory.conversations.length}</div>
          <div className="text-xs text-slate-500">Conversations</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{memory.projects.size}</div>
          <div className="text-xs text-slate-500">Projects</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{memory.technologies.size}</div>
          <div className="text-xs text-slate-500">Technologies</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{memory.agenda.length}</div>
          <div className="text-xs text-slate-500">Agenda Items</div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div>
        <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          📜 Recent Conversations
        </h4>
        {recentConversations.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No conversations yet</p>
        ) : (
          <div className="space-y-2">
            {recentConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="w-full text-left bg-slate-900 hover:bg-slate-700 rounded-lg p-3 transition-colors group"
              >
                <p className="text-sm text-slate-300 line-clamp-1 group-hover:text-white">
                  {conv.user.substring(0, 50)}...
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{new Date(conv.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>{conv.extracted.projects.length} projects</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Tags */}
      {memory.technologies.size > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-400 mb-3">💻 Known Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(memory.technologies).slice(0, 10).map((tech, idx) => (
              <span key={idx} className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded text-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Known Projects */}
      {memory.projects.size > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-400 mb-3">📁 Known Projects</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(memory.projects).slice(0, 8).map((project, idx) => (
              <span key={idx} className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs">
                {project}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
