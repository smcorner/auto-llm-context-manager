import { useState, useCallback, useRef, useEffect } from 'react';
import { useWorkspaces } from './hooks/useWorkspaces';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { ProcessingLog } from './components/ProcessingLog';
import { AgendaPanel } from './components/AgendaPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { OutputPanel } from './components/OutputPanel';
import { TimelineView } from './components/TimelineView';
import { ExportPanel } from './components/ExportPanel';
import { SuccessAlert } from './components/SuccessAlert';
import { CopyNotification } from './components/CopyNotification';
import type { ExtractedInfo, StoredConversation, ContextMemory } from './types';

const SAMPLE_CONVERSATIONS = [
  "User: I'm working on a Python project called DataAnalyzer that needs to process CSV files. My budget is $5000 and the deadline is next Friday. I need to implement data filtering, statistics calculation, and visualization features.\n\nAssistant: I'd be happy to help you build the DataAnalyzer project! Here's a comprehensive plan:\n\n1. **Data Filtering Module** - We'll use pandas for efficient CSV processing\n2. **Statistics Calculator** - numpy and scipy for statistical analysis\n3. **Visualization** - matplotlib and plotly for interactive charts\n\nShall I start with the project structure?",
  "User: We need to build a React dashboard for our ClientPortal system. The team consists of John Smith and Sarah Johnson. We have 3 weeks to complete this and the budget is $15000. Must use TypeScript and Tailwind CSS.\n\nAssistant: Great! Let me outline the ClientPortal dashboard architecture. With TypeScript and Tailwind, we'll have excellent type safety and styling flexibility.",
  "User: I want to create an AI chatbot using Node.js and OpenAI API. The goal is to achieve 90% customer satisfaction. We have until December 15th to launch ChatBot Pro.\n\nAssistant: Let's design the ChatBot Pro system! I'll help you integrate the OpenAI API with a Node.js backend.",
];

// Convert workspace to ContextMemory format for components
const workspaceToMemory = (ws: {
  conversations: StoredConversation[];
  projects: string[];
  tasks: string[];
  technologies: string[];
  names: string[];
  numbers: string[];
  agenda: ContextMemory['agenda'];
  insights: ContextMemory['insights'];
}): ContextMemory => ({
  conversations: ws.conversations,
  projects: new Set(ws.projects),
  tasks: new Set(ws.tasks),
  technologies: new Set(ws.technologies),
  names: new Set(ws.names),
  numbers: new Set(ws.numbers),
  agenda: ws.agenda,
  insights: ws.insights,
});

export function App() {
  const [conversationInput, setConversationInput] = useState('');
  const [enhancedOutput, setEnhancedOutput] = useState('');
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'output' | 'extracted' | 'timeline' | 'export'>('log');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const {
    activeWorkspace,
    workspaces,
    processingLogs,
    isProcessing,
    currentStep,
    totalSteps,
    createWorkspace,
    switchWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    exportWorkspace,
    importWorkspace,
    processWithLogs,
    storeConversation,
    toggleAgendaStatus,
    removeAgendaItem,
    clearWorkspaceMemory,
    getStats,
  } = useWorkspaces();

  const stats = getStats();
  const memory = workspaceToMemory(activeWorkspace);

  const handleProcess = useCallback(async () => {
    if (!conversationInput.trim()) {
      alert('Please paste a conversation first!');
      return;
    }

    try {
      const result = await processWithLogs(conversationInput);
      storeConversation(result.parsed, result.extracted, result.insights, result.agendaItems);
      setEnhancedOutput(result.enhanced);
      setExtractedInfo(result.extracted);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveTab('output');
    } catch (error) {
      console.error('Processing error:', error);
    }
  }, [conversationInput, processWithLogs, storeConversation]);

  const handleLoadSample = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * SAMPLE_CONVERSATIONS.length);
    setConversationInput(SAMPLE_CONVERSATIONS[randomIdx]);
  }, []);

  const handleCopyOutput = useCallback(async () => {
    if (!enhancedOutput) return;
    try {
      await navigator.clipboard.writeText(enhancedOutput);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [enhancedOutput]);

  const handleClearMemory = useCallback(() => {
    if (confirm('Are you sure you want to clear all data in this workspace?')) {
      clearWorkspaceMemory();
      setEnhancedOutput('');
      setExtractedInfo(null);
    }
  }, [clearWorkspaceMemory]);

  const handleSelectConversation = useCallback((conv: StoredConversation) => {
    setConversationInput(`User: ${conv.user}\n\nAssistant: ${conv.assistant}`);
  }, []);

  const handleSwitchWorkspace = useCallback((id: string) => {
    switchWorkspace(id);
    setEnhancedOutput('');
    setExtractedInfo(null);
    setConversationInput('');
  }, [switchWorkspace]);

  useEffect(() => {
    if (!isProcessing && enhancedOutput && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isProcessing, enhancedOutput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex">
      <SuccessAlert visible={showSuccess} />
      <CopyNotification visible={showCopied} />

      {/* Workspace Sidebar */}
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspace.id}
        onSwitch={handleSwitchWorkspace}
        onCreate={createWorkspace}
        onDelete={deleteWorkspace}
        onDuplicate={duplicateWorkspace}
        onExport={exportWorkspace}
        onImport={importWorkspace}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-700">
          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-2xl"
                      style={{ filter: `drop-shadow(0 0 8px ${activeWorkspace.color})` }}
                    >
                      {activeWorkspace.icon}
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold text-white">
                      {activeWorkspace.name}
                    </h1>
                  </div>
                  <p className="text-slate-500 text-sm mt-0.5 hidden md:block">
                    {activeWorkspace.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeWorkspace.color }}
                />
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-6">
              {[
                { label: 'Conversations', value: stats.conversations, color: 'text-violet-400' },
                { label: 'Facts', value: stats.facts, color: 'text-blue-400' },
                { label: 'Projects', value: stats.projects, color: 'text-emerald-400' },
                { label: 'Tasks', value: stats.tasks, color: 'text-amber-400' },
                { label: 'Agenda', value: stats.agenda, color: 'text-orange-400' },
                { label: 'Insights', value: stats.insights, color: 'text-pink-400' },
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-800/50 rounded-xl p-3 md:p-4 text-center border border-slate-700/50"
                >
                  <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Input & Memory */}
              <div className="space-y-6">
                {/* Input Section */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📝 Input Conversation
                  </h2>
                  
                  <textarea
                    value={conversationInput}
                    onChange={(e) => setConversationInput(e.target.value)}
                    placeholder={"Paste any conversation here...\n\nExample:\nUser: I need help with my project\nAssistant: I'll help you with that"}
                    className="w-full h-40 p-4 bg-slate-900 border-2 border-slate-700 rounded-xl text-slate-100 resize-none focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-500 text-sm"
                  />

                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-600 rounded-xl text-white font-bold text-lg uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed"
                    style={{ 
                      background: isProcessing ? undefined : `linear-gradient(135deg, ${activeWorkspace.color}, ${activeWorkspace.color}dd)`,
                      boxShadow: isProcessing ? undefined : `0 10px 30px ${activeWorkspace.color}40`
                    }}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      '🚀 PROCESS WITH AI'
                    )}
                  </button>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleLoadSample}
                      className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-medium transition-colors text-sm"
                    >
                      📋 Sample
                    </button>
                    <button
                      onClick={handleClearMemory}
                      className="py-3 px-4 bg-slate-700 hover:bg-red-600 rounded-lg text-white font-medium transition-colors text-sm"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>

                {/* Memory Panel */}
                <MemoryPanel 
                  memory={memory} 
                  onSelectConversation={handleSelectConversation}
                />
              </div>

              {/* Middle Column - Processing Log */}
              <div className="lg:col-span-1">
                <ProcessingLog 
                  logs={processingLogs}
                  isProcessing={isProcessing}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                />
              </div>

              {/* Right Column - Agenda & Insights */}
              <div className="space-y-6">
                <AgendaPanel 
                  agenda={memory.agenda}
                  onToggleStatus={toggleAgendaStatus}
                  onRemove={removeAgendaItem}
                />
                <InsightsPanel insights={memory.insights} />
              </div>
            </div>

            {/* Output Section */}
            <div ref={outputRef} className="mt-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'output', label: '✨ Enhanced Output' },
                  { id: 'extracted', label: '🔍 Extracted Data' },
                  { id: 'timeline', label: '📅 Timeline' },
                  { id: 'export', label: '📤 Export' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'text-white' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: activeWorkspace.color } : undefined}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'output' && (
                <OutputPanel output={enhancedOutput} onCopy={handleCopyOutput} />
              )}

              {activeTab === 'extracted' && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                  {extractedInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { title: '📁 Projects', items: extractedInfo.projects, color: 'bg-emerald-500/20 text-emerald-300' },
                        { title: '💻 Technologies', items: extractedInfo.technologies, color: 'bg-blue-500/20 text-blue-300' },
                        { title: '📋 Tasks', items: extractedInfo.tasks, color: 'bg-amber-500/20 text-amber-300' },
                        { title: '⚡ Actions', items: extractedInfo.actions, color: 'bg-purple-500/20 text-purple-300' },
                        { title: '🎯 Goals', items: extractedInfo.goals, color: 'bg-pink-500/20 text-pink-300' },
                        { title: '⚠️ Constraints', items: extractedInfo.constraints, color: 'bg-red-500/20 text-red-300' },
                        { title: '👤 Names', items: extractedInfo.names, color: 'bg-cyan-500/20 text-cyan-300' },
                        { title: '🔢 Numbers', items: extractedInfo.numbers, color: 'bg-orange-500/20 text-orange-300' },
                        { title: '📅 Dates', items: extractedInfo.dates, color: 'bg-violet-500/20 text-violet-300' },
                      ].map((category, idx) => (
                        category.items.length > 0 && (
                          <div key={idx} className="bg-slate-700/50 rounded-xl p-4">
                            <h4 className="font-bold text-slate-200 mb-3">{category.title}</h4>
                            <div className="flex flex-wrap gap-2">
                              {category.items.slice(0, 8).map((item, itemIdx) => (
                                <span key={itemIdx} className={`px-2 py-1 rounded text-xs ${category.color}`}>
                                  {item.length > 40 ? item.substring(0, 40) + '...' : item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <div className="text-4xl mb-4">🔍</div>
                      <p>Process a conversation to see extracted data</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <TimelineView 
                  conversations={memory.conversations} 
                  insights={memory.insights} 
                />
              )}

              {activeTab === 'export' && (
                <ExportPanel 
                  memory={memory} 
                  enhancedOutput={enhancedOutput} 
                />
              )}
            </div>

            {/* Footer */}
            <footer className="text-center text-slate-500 text-sm py-8 mt-8 border-t border-slate-800">
              <p>🧠 Context is automatically saved to your browser's local storage</p>
              <p className="mt-1">Built with React, TypeScript & Tailwind CSS | AI Context Manager Pro v3.0</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
