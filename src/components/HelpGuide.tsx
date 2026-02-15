import { useState } from 'react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  const [activeSection, setActiveSection] = useState(0);

  if (!isOpen) return null;

  const sections = [
    {
      title: '🚀 Quick Start',
      content: [
        '## Quick Start Guide',
        '',
        '### Step 1: Create a Workspace',
        '1. Click "📂 Workspaces" in the sidebar',
        '2. Click "➕ New Workspace"',
        '3. Choose icon, color, name, and description',
        '4. Click "Create"',
        '',
        '### Step 2: Add a Conversation',
        '1. Paste your AI conversation in the input box',
        '2. Click "🚀 PROCESS WITH AI"',
        '3. Watch the AI analyze your conversation',
        '',
        '### Step 3: Get Your Enhanced Prompt',
        '1. Click "✨ Enhanced Output" tab',
        '2. Copy the generated prompt',
        '3. Paste into ChatGPT/Claude for context-aware responses!',
      ].join('\n')
    },
    {
      title: '📂 Workspaces',
      content: [
        '## Multi-Workspace Guide',
        '',
        '### What are Workspaces?',
        'Workspaces let you organize different projects separately.',
        'Each workspace has its own:',
        '- Conversation history',
        '- Extracted information',
        '- Agenda items',
        '- AI insights',
        '',
        '### Example Workspaces:',
        '📱 Mobile App - React Native development',
        '🌐 Website - Company website project',
        '🤖 AI Bot - Chatbot development',
        '📊 Analytics - Data analysis scripts',
        '🎨 Design - UI/UX project',
        '',
        '### Workspace Actions:',
        '- Switch: Click any workspace to switch to it',
        '- Duplicate: Right-click → Duplicate',
        '- Export: Right-click → Export (saves as JSON)',
        '- Import: Click "Import Workspace" and select file',
        '- Delete: Right-click → Delete',
      ].join('\n')
    },
    {
      title: '📝 Sample Inputs',
      content: [
        '## Sample Conversations to Try',
        '',
        '### Sample 1: Python Project',
        'User: I need help with my Python project called DataAnalyzer.',
        'My budget is $5000 and the deadline is next Friday.',
        'I need to implement data filtering and visualization.',
        'We will use pandas and matplotlib.',
        '',
        'Assistant: I would be happy to help you build the DataAnalyzer!',
        '',
        '---',
        '',
        '### Sample 2: React Dashboard',
        'User: We need to build a React dashboard for ClientPortal.',
        'The team is John Smith and Sarah Johnson.',
        'Budget is $15000, deadline in 3 weeks.',
        'Must use TypeScript and Tailwind CSS.',
        '',
        '---',
        '',
        '### Sample 3: AI Chatbot',
        'User: I want to create an AI chatbot using Node.js.',
        'The goal is 90% customer satisfaction.',
        'We have until December 15th to launch ChatBot Pro.',
      ].join('\n')
    },
    {
      title: '💭 AI Thinking Log',
      content: [
        '## Understanding the AI Processing Log',
        '',
        'The log shows 8 steps of AI processing:',
        '',
        '### Step 1: 🧠 Memory Access',
        'Retrieves previous conversations and stored context',
        '',
        '### Step 2: 🔍 Parsing',
        'Identifies user and assistant parts of conversation',
        '',
        '### Step 3: 📤 Extraction',
        'Finds projects, technologies, tasks, names, numbers, dates',
        '',
        '### Step 4: 💭 AI Reasoning',
        'Compares with historical data and finds patterns',
        '',
        '### Step 5: 💡 Insights',
        'Generates observations, recommendations, warnings',
        '',
        '### Step 6: 📋 Agenda Update',
        'Creates prioritized task items automatically',
        '',
        '### Step 7: 🔗 Synthesis',
        'Combines all information into coherent context',
        '',
        '### Step 8: ✨ Output',
        'Generates the enhanced prompt with full context',
      ].join('\n')
    },
    {
      title: '✨ Enhanced Prompt',
      content: [
        '## Understanding the Enhanced Prompt',
        '',
        'The enhanced prompt includes these sections:',
        '',
        '### 📂 WORKSPACE',
        'Shows which project/workspace this belongs to',
        '',
        '### 🧠 MEMORY ACCESS LOG',
        'Statistics about stored memory:',
        '- Total conversations',
        '- Known projects',
        '- Technology stack',
        '',
        '### 📜 LAST SESSION SUMMARY',
        'What happened in the previous session',
        '',
        '### 📋 CURRENT AGENDA',
        'Pending tasks with priority levels',
        '',
        '### 💭 AI THOUGHT PROCESS',
        'Insights and recommendations',
        '',
        '### 🔍 CURRENT INPUT ANALYSIS',
        'Extracted info from current conversation',
        '',
        '### 💬 CURRENT REQUEST',
        'The actual user message',
        '',
        '### 📝 CONTINUITY INSTRUCTIONS',
        'Guidelines for AI to maintain context',
      ].join('\n')
    },
    {
      title: '💡 Tips',
      content: [
        '## Tips for Best Results',
        '',
        '### Be Specific',
        'Include project names, deadlines, budgets, and team names.',
        'The more specific, the better extraction!',
        '',
        '### Use Consistent Names',
        'Always refer to your project by the same name.',
        'Example: Always say "DataAnalyzer" not "the project"',
        '',
        '### Add Conversations Regularly',
        'After each AI chat session, paste the conversation.',
        'More conversations = smarter context!',
        '',
        '### Use Workspaces',
        'Create separate workspaces for different projects.',
        'This keeps context clean and relevant.',
        '',
        '### Review Agenda',
        'Check the auto-generated agenda regularly.',
        'Mark completed tasks to track progress.',
        '',
        '### Export Regularly',
        'Export your workspaces as backup.',
        'You can import them later if needed.',
        '',
        '### Copy the Full Prompt',
        'Always copy the FULL enhanced prompt.',
        'Paste at the START of new AI conversations.',
      ].join('\n')
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">📚 User Guide</h2>
            <p className="text-slate-400 text-sm mt-1">Complete guide to AI Context Manager Pro</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-slate-700 overflow-x-auto">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSection(idx)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === idx
                  ? 'text-violet-400 border-b-2 border-violet-400 bg-slate-700/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {sections[activeSection].content}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-between items-center">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            ← Previous
          </button>
          <span className="text-slate-500 text-sm">
            {activeSection + 1} / {sections.length}
          </span>
          <button
            onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
            disabled={activeSection === sections.length - 1}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
