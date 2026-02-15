import { useState } from 'react';
import type { ContextMemory } from '../types';

interface ExportPanelProps {
  memory: ContextMemory;
  enhancedOutput: string;
}

export function ExportPanel({ memory, enhancedOutput }: ExportPanelProps) {
  const [exported, setExported] = useState(false);

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      statistics: {
        totalConversations: memory.conversations.length,
        projects: Array.from(memory.projects),
        technologies: Array.from(memory.technologies),
        agendaItems: memory.agenda.length,
        insights: memory.insights.length,
      },
      conversations: memory.conversations.map(c => ({
        timestamp: c.timestamp,
        user: c.user,
        assistant: c.assistant,
        extracted: c.extracted,
      })),
      agenda: memory.agenda,
      insights: memory.insights,
      latestEnhancedPrompt: enhancedOutput,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-context-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const exportAsMarkdown = () => {
    let md = `# AI Context Manager Export\n`;
    md += `_Exported on ${new Date().toLocaleString()}_\n\n`;
    
    md += `## Statistics\n`;
    md += `- **Conversations:** ${memory.conversations.length}\n`;
    md += `- **Projects:** ${Array.from(memory.projects).join(', ') || 'None'}\n`;
    md += `- **Technologies:** ${Array.from(memory.technologies).join(', ') || 'None'}\n`;
    md += `- **Agenda Items:** ${memory.agenda.length}\n`;
    md += `- **Insights:** ${memory.insights.length}\n\n`;

    if (memory.agenda.length > 0) {
      md += `## Agenda\n`;
      memory.agenda.forEach(item => {
        const status = item.status === 'completed' ? '✅' : item.status === 'in-progress' ? '🔄' : '⬜';
        md += `${status} ${item.task} (${item.priority})\n`;
      });
      md += '\n';
    }

    if (memory.insights.length > 0) {
      md += `## Insights\n`;
      memory.insights.slice(-10).forEach(insight => {
        md += `- **[${insight.type}]** ${insight.content}\n`;
      });
      md += '\n';
    }

    if (enhancedOutput) {
      md += `## Latest Enhanced Prompt\n`;
      md += '```\n' + enhancedOutput + '\n```\n';
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-context-export-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const copyToClipboard = async () => {
    const summary = `AI Context Summary (${new Date().toLocaleDateString()})

📊 Stats: ${memory.conversations.length} conversations, ${memory.projects.size} projects, ${memory.technologies.size} technologies

📁 Projects: ${Array.from(memory.projects).slice(0, 5).join(', ') || 'None'}
💻 Technologies: ${Array.from(memory.technologies).slice(0, 8).join(', ') || 'None'}
📋 Pending Tasks: ${memory.agenda.filter(a => a.status !== 'completed').length}

${enhancedOutput ? '---\nLatest Prompt:\n' + enhancedOutput.substring(0, 500) + '...' : ''}`;

    await navigator.clipboard.writeText(summary);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
        📤 Export & Share
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={exportData}
          className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left"
        >
          <div className="text-2xl mb-2">📄</div>
          <div className="font-semibold text-slate-200">Export JSON</div>
          <div className="text-xs text-slate-400 mt-1">Full data export</div>
        </button>

        <button
          onClick={exportAsMarkdown}
          className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left"
        >
          <div className="text-2xl mb-2">📝</div>
          <div className="font-semibold text-slate-200">Export Markdown</div>
          <div className="text-xs text-slate-400 mt-1">Human-readable format</div>
        </button>

        <button
          onClick={copyToClipboard}
          className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-left"
        >
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-slate-200">Copy Summary</div>
          <div className="text-xs text-slate-400 mt-1">Quick share clipboard</div>
        </button>
      </div>

      {exported && (
        <div className="mt-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 text-center text-emerald-300 text-sm animate-fadeIn">
          ✅ Export completed successfully!
        </div>
      )}
    </div>
  );
}
