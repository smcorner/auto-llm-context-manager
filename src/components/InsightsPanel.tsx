import type { AIInsight } from '../types';

interface InsightsPanelProps {
  insights: AIInsight[];
}

const typeConfig = {
  observation: { icon: '👁️', color: 'border-blue-500 bg-blue-500/10' },
  recommendation: { icon: '💡', color: 'border-yellow-500 bg-yellow-500/10' },
  warning: { icon: '⚠️', color: 'border-red-500 bg-red-500/10' },
  connection: { icon: '🔗', color: 'border-cyan-500 bg-cyan-500/10' },
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const recentInsights = [...insights].reverse().slice(0, 8);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
        💡 AI Insights & Patterns
      </h3>

      {recentInsights.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-3xl mb-2">🔮</div>
          <p>No insights generated yet</p>
          <p className="text-sm">Process multiple conversations to see patterns</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentInsights.map(insight => {
            const config = typeConfig[insight.type];
            return (
              <div 
                key={insight.id}
                className={`border-l-4 rounded-r-lg p-4 ${config.color}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm">{insight.content}</p>
                    {insight.relatedTo && insight.relatedTo.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {insight.relatedTo.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-2">
                      {new Date(insight.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
