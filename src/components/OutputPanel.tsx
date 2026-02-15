import { useState } from 'react';

interface OutputPanelProps {
  output: string;
  onCopy: () => void;
}

export function OutputPanel({ output, onCopy }: OutputPanelProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  // Parse the output into sections
  const parseOutput = (text: string) => {
    const sections: { title: string; content: string; icon: string }[] = [];
    const lines = text.split('\n');
    let currentSection = { title: '', content: '', icon: '📄' };
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection.title) {
          sections.push({ ...currentSection });
        }
        const titleMatch = line.match(/## (.+)/);
        if (titleMatch) {
          const title = titleMatch[1];
          currentSection = {
            title: title.replace(/[🧠📜📋💭🔍💬📝]/g, '').trim(),
            content: '',
            icon: title.match(/[🧠📜📋💭🔍💬📝]/)?.[0] || '📄',
          };
        }
      } else if (line.startsWith('╔') || line.startsWith('╚') || line.startsWith('║')) {
        // Skip decorative lines in formatted view
        continue;
      } else {
        currentSection.content += line + '\n';
      }
    }
    if (currentSection.title) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const sections = output ? parseOutput(output) : [];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className="font-mono text-slate-300">Enhanced Context Prompt</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('formatted')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'formatted' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Formatted
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'raw' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw
            </button>
          </div>
          <button
            onClick={onCopy}
            disabled={!output}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 max-h-[600px] overflow-y-auto scrollbar-thin">
        {!output ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg">Enhanced prompt will appear here</p>
            <p className="text-sm mt-2">Process a conversation to generate the AI context prompt</p>
          </div>
        ) : viewMode === 'raw' ? (
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {output}
          </pre>
        ) : (
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden animate-fadeIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="bg-slate-700/30 px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <h4 className="font-semibold text-slate-200">{section.title}</h4>
                </div>
                <div className="p-4">
                  <pre className="text-sm text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                    {section.content.trim()}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {output && (
        <div className="bg-slate-900 px-6 py-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
          <span>{output.length} characters</span>
          <span>{output.split('\n').length} lines</span>
          <span>{sections.length} sections</span>
        </div>
      )}
    </div>
  );
}
