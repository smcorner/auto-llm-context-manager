import { useState, useEffect, useCallback } from 'react';
import type { 
  ProjectWorkspace, 
  AppState, 
  SerializedWorkspace,
  StoredConversation,
  ExtractedInfo,
  AIInsight,
  AgendaItem,
  ParsedConversation,
  LogEntry
} from '../types';

const STORAGE_KEY = 'llm_workspaces_v3';

const generateId = () => `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultWorkspace = (): ProjectWorkspace => ({
  id: generateId(),
  name: 'Default Workspace',
  description: 'Your main workspace for general conversations',
  color: '#8b5cf6',
  icon: '📁',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  conversations: [],
  projects: [],
  tasks: [],
  technologies: [],
  names: [],
  numbers: [],
  agenda: [],
  insights: [],
});

const serializeWorkspace = (ws: ProjectWorkspace): SerializedWorkspace => ({
  id: ws.id,
  name: ws.name,
  description: ws.description,
  color: ws.color,
  icon: ws.icon,
  createdAt: ws.createdAt,
  updatedAt: ws.updatedAt,
  memory: {
    conversations: ws.conversations,
    projects: ws.projects,
    tasks: ws.tasks,
    technologies: ws.technologies,
    names: ws.names,
    numbers: ws.numbers,
    agenda: ws.agenda,
    insights: ws.insights,
  },
});

const deserializeWorkspace = (data: SerializedWorkspace): ProjectWorkspace => ({
  id: data.id,
  name: data.name,
  description: data.description,
  color: data.color,
  icon: data.icon,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  conversations: data.memory.conversations || [],
  projects: data.memory.projects || [],
  tasks: data.memory.tasks || [],
  technologies: data.memory.technologies || [],
  names: data.memory.names || [],
  numbers: data.memory.numbers || [],
  agenda: data.memory.agenda || [],
  insights: data.memory.insights || [],
});

export function useWorkspaces() {
  const [appState, setAppState] = useState<AppState>(() => {
    const defaultWs = createDefaultWorkspace();
    return {
      activeWorkspaceId: defaultWs.id,
      workspaces: [defaultWs],
    };
  });
  
  const [processingLogs, setProcessingLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const workspaces = (parsed.workspaces || []).map(deserializeWorkspace);
        if (workspaces.length === 0) {
          workspaces.push(createDefaultWorkspace());
        }
        setAppState({
          activeWorkspaceId: parsed.activeWorkspaceId || workspaces[0].id,
          workspaces,
        });
      } catch (e) {
        console.error('Failed to load workspaces:', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveState = useCallback((state: AppState) => {
    const serialized = {
      activeWorkspaceId: state.activeWorkspaceId,
      workspaces: state.workspaces.map(serializeWorkspace),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  }, []);

  // Get active workspace
  const activeWorkspace = appState.workspaces.find(ws => ws.id === appState.activeWorkspaceId) 
    || appState.workspaces[0];

  // Create new workspace
  const createWorkspace = useCallback((name: string, description: string, color: string, icon: string) => {
    const newWorkspace: ProjectWorkspace = {
      id: generateId(),
      name,
      description,
      color,
      icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversations: [],
      projects: [],
      tasks: [],
      technologies: [],
      names: [],
      numbers: [],
      agenda: [],
      insights: [],
    };
    
    setAppState(prev => {
      const newState = {
        ...prev,
        workspaces: [...prev.workspaces, newWorkspace],
        activeWorkspaceId: newWorkspace.id,
      };
      saveState(newState);
      return newState;
    });
    
    return newWorkspace;
  }, [saveState]);

  // Switch workspace
  const switchWorkspace = useCallback((workspaceId: string) => {
    setAppState(prev => {
      const newState = { ...prev, activeWorkspaceId: workspaceId };
      saveState(newState);
      return newState;
    });
    setProcessingLogs([]);
  }, [saveState]);

  // Update workspace
  const updateWorkspace = useCallback((workspaceId: string, updates: Partial<ProjectWorkspace>) => {
    setAppState(prev => {
      const newWorkspaces = prev.workspaces.map(ws => 
        ws.id === workspaceId 
          ? { ...ws, ...updates, updatedAt: new Date().toISOString() }
          : ws
      );
      const newState = { ...prev, workspaces: newWorkspaces };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Delete workspace
  const deleteWorkspace = useCallback((workspaceId: string) => {
    setAppState(prev => {
      if (prev.workspaces.length <= 1) {
        alert('Cannot delete the last workspace!');
        return prev;
      }
      const newWorkspaces = prev.workspaces.filter(ws => ws.id !== workspaceId);
      const newActiveId = prev.activeWorkspaceId === workspaceId 
        ? newWorkspaces[0].id 
        : prev.activeWorkspaceId;
      const newState = {
        workspaces: newWorkspaces,
        activeWorkspaceId: newActiveId,
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Duplicate workspace
  const duplicateWorkspace = useCallback((workspaceId: string) => {
    const source = appState.workspaces.find(ws => ws.id === workspaceId);
    if (!source) return;
    
    const newWorkspace: ProjectWorkspace = {
      ...source,
      id: generateId(),
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setAppState(prev => {
      const newState = {
        ...prev,
        workspaces: [...prev.workspaces, newWorkspace],
      };
      saveState(newState);
      return newState;
    });
  }, [appState.workspaces, saveState]);

  // Add log entry
  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: Date.now() + Math.random(),
      timestamp: new Date(),
    };
    setProcessingLogs(prev => [...prev, newLog]);
    return newLog.id;
  }, []);

  // Update log entry
  const updateLog = useCallback((id: number, updates: Partial<LogEntry>) => {
    setProcessingLogs(prev => 
      prev.map(log => log.id === id ? { ...log, ...updates } : log)
    );
  }, []);

  // Parse conversation
  const parseConversation = useCallback((text: string): ParsedConversation => {
    const result: ParsedConversation = {
      user: '',
      assistant: '',
      fullText: text,
      timestamp: new Date().toISOString(),
    };

    const userPattern = /(?:User|Human|You|Q|Question|Me)[\s:]+(.+?)(?=(?:Assistant|AI|Bot|A|Answer|Response)[\s:]|$)/is;
    const assistantPattern = /(?:Assistant|AI|Bot|A|Answer|Response)[\s:]+(.+?)$/is;

    const userMatch = text.match(userPattern);
    const assistantMatch = text.match(assistantPattern);

    if (userMatch) result.user = userMatch[1].trim();
    if (assistantMatch) result.assistant = assistantMatch[1].trim();
    if (!result.user) result.user = text;

    return result;
  }, []);

  // Extract information
  const extractInformation = useCallback((parsed: ParsedConversation): ExtractedInfo => {
    const fullText = `${parsed.user} ${parsed.assistant}`;

    const actionPatterns = fullText.match(/(?:create|build|implement|design|develop|analyze|process|generate|fix|update|delete|add|remove|modify|test|deploy|configure|setup|install)[\s]+[^.!?]{5,50}/gi) || [];
    const goalPatterns = fullText.match(/(?:goal is to|aim to|objective is|want to achieve|trying to|need to accomplish)[\s]+[^.!?]+/gi) || [];
    const constraintPatterns = fullText.match(/(?:budget|deadline|limit|constraint|requirement|must be|cannot|should not|within|by|before)[\s]+[^.!?]+/gi) || [];

    return {
      projects: fullText.match(/\b[A-Z][A-Za-z]*(?:App|System|Tool|Analyzer|Manager|Project|Platform|Service|Bot|API|Dashboard|Portal)\b/g) || [],
      technologies: fullText.match(/\b(?:Python|JavaScript|TypeScript|Java|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|React|Vue|Angular|Svelte|Next\.?js|Node\.?js|Django|Flask|FastAPI|Express|Spring|Rails|Laravel|HTML|CSS|SASS|SCSS|SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Redis|GraphQL|REST|AWS|Azure|GCP|Docker|Kubernetes|Git|GitHub|GitLab|Jira|Figma|Tailwind|Bootstrap|Webpack|Vite|npm|yarn|pip|conda)\b/gi) || [],
      tasks: (fullText.match(/(?:need to|have to|must|should|will|want to|going to|plan to) ([^.!?]+)/gi) || [])
        .map(t => t.replace(/^(need to|have to|must|should|will|want to|going to|plan to)\s+/i, '')),
      names: (fullText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || []).filter(n => !n.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/)),
      numbers: fullText.match(/\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:percent|%|dollars|USD|EUR|hours|days|weeks|months|years))?/g) || [],
      dates: fullText.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|today|tomorrow|yesterday|next week|next month|next Friday|this week|this month|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi) || [],
      quotes: fullText.match(/"([^"]+)"/g) || [],
      actions: actionPatterns.slice(0, 10),
      goals: goalPatterns.slice(0, 5),
      constraints: constraintPatterns.slice(0, 5),
    };
  }, []);

  // Generate insights
  const generateInsights = useCallback((extracted: ExtractedInfo, workspace: ProjectWorkspace): AIInsight[] => {
    const insights: AIInsight[] = [];
    const now = new Date().toISOString();

    const existingTechs = new Set(workspace.technologies);
    const newTechs = extracted.technologies.filter(t => !existingTechs.has(t));
    
    if (newTechs.length > 0 && existingTechs.size > 0) {
      insights.push({
        id: Date.now(),
        type: 'connection',
        content: `New technologies (${newTechs.join(', ')}) mentioned alongside existing stack (${Array.from(existingTechs).slice(0, 3).join(', ')})`,
        timestamp: now,
        relatedTo: [...newTechs, ...Array.from(existingTechs).slice(0, 3)],
      });
    }

    if (extracted.projects.length > 0 && workspace.projects.length > 0) {
      insights.push({
        id: Date.now() + 1,
        type: 'observation',
        content: `Working on ${extracted.projects.length} project(s). Total projects tracked: ${workspace.projects.length + extracted.projects.length}`,
        timestamp: now,
        relatedTo: extracted.projects,
      });
    }

    if (extracted.constraints.length > 0) {
      insights.push({
        id: Date.now() + 2,
        type: 'warning',
        content: `Detected ${extracted.constraints.length} constraint(s): ${extracted.constraints[0]}`,
        timestamp: now,
      });
    }

    if (extracted.tasks.length > 3) {
      insights.push({
        id: Date.now() + 3,
        type: 'recommendation',
        content: `Multiple tasks detected (${extracted.tasks.length}). Consider prioritizing and breaking down into smaller steps.`,
        timestamp: now,
      });
    }

    return insights;
  }, []);

  // Create agenda items
  const createAgendaItems = useCallback((extracted: ExtractedInfo): AgendaItem[] => {
    const now = new Date().toISOString();
    return extracted.tasks.slice(0, 5).map((task, idx) => ({
      id: Date.now() + idx,
      task: task.charAt(0).toUpperCase() + task.slice(1),
      status: 'pending' as const,
      priority: idx === 0 ? 'high' as const : idx < 3 ? 'medium' as const : 'low' as const,
      createdAt: now,
    }));
  }, []);

  // Generate enhanced prompt
  const generateEnhancedPrompt = useCallback((
    parsed: ParsedConversation, 
    workspace: ProjectWorkspace,
    extracted: ExtractedInfo,
    insights: AIInsight[]
  ): string => {
    const lines: string[] = [];

    lines.push("╔══════════════════════════════════════════════════════════════╗");
    lines.push(`║   🤖 AI CONTEXT MANAGER - ${workspace.name.toUpperCase().padEnd(30)}  ║`);
    lines.push("╚══════════════════════════════════════════════════════════════╝");
    lines.push("");

    lines.push(`## 📂 WORKSPACE: ${workspace.icon} ${workspace.name}`);
    lines.push(`Description: ${workspace.description}`);
    lines.push(`Last Updated: ${new Date(workspace.updatedAt).toLocaleString()}`);
    lines.push("");

    lines.push("## 🧠 MEMORY ACCESS LOG");
    lines.push(`📊 Total Conversations in Memory: ${workspace.conversations.length}`);
    lines.push(`📁 Known Projects: ${workspace.projects.slice(-5).join(', ') || 'None'}`);
    lines.push(`💻 Technology Stack: ${workspace.technologies.slice(-8).join(', ') || 'None'}`);
    lines.push("");

    if (workspace.conversations.length > 0) {
      lines.push("## 📜 LAST SESSION SUMMARY");
      const lastConv = workspace.conversations[workspace.conversations.length - 1];
      lines.push(`Last Activity: ${new Date(lastConv.timestamp).toLocaleString()}`);
      lines.push(`Topic: ${lastConv.user.substring(0, 100)}...`);
      if (lastConv.extracted.projects.length > 0) {
        lines.push(`Projects Discussed: ${lastConv.extracted.projects.join(', ')}`);
      }
      lines.push("");
    }

    const pendingAgenda = workspace.agenda.filter(a => a.status !== 'completed');
    if (pendingAgenda.length > 0) {
      lines.push("## 📋 CURRENT AGENDA");
      pendingAgenda.slice(0, 5).forEach((item, idx) => {
        const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
        lines.push(`${idx + 1}. ${priorityEmoji} ${item.task}`);
      });
      lines.push("");
    }

    if (insights.length > 0) {
      lines.push("## 💭 AI THOUGHT PROCESS");
      insights.forEach(insight => {
        const emoji = insight.type === 'observation' ? '👁️' : 
                     insight.type === 'recommendation' ? '💡' : 
                     insight.type === 'warning' ? '⚠️' : '🔗';
        lines.push(`${emoji} [${insight.type.toUpperCase()}] ${insight.content}`);
      });
      lines.push("");
    }

    lines.push("## 🔍 CURRENT INPUT ANALYSIS");
    if (extracted.projects.length > 0) lines.push(`📁 Projects: ${extracted.projects.join(', ')}`);
    if (extracted.technologies.length > 0) lines.push(`💻 Technologies: ${extracted.technologies.join(', ')}`);
    if (extracted.tasks.length > 0) lines.push(`📋 Tasks: ${extracted.tasks.slice(0, 3).join('; ')}`);
    if (extracted.constraints.length > 0) lines.push(`⚠️ Constraints: ${extracted.constraints.join('; ')}`);
    if (extracted.goals.length > 0) lines.push(`🎯 Goals: ${extracted.goals.join('; ')}`);
    lines.push("");

    lines.push("## 💬 CURRENT REQUEST");
    lines.push("───────────────────────────────────────────────────────────────");
    lines.push(`User: ${parsed.user}`);
    if (parsed.assistant) {
      lines.push("");
      lines.push(`Previous Response: ${parsed.assistant.substring(0, 300)}${parsed.assistant.length > 300 ? '...' : ''}`);
    }
    lines.push("───────────────────────────────────────────────────────────────");
    lines.push("");

    lines.push("## 📝 CONTINUITY INSTRUCTIONS");
    lines.push("• Reference memory context when addressing the user's request");
    lines.push("• Continue any ongoing tasks mentioned in the agenda");
    lines.push("• Consider the AI insights and recommendations above");
    lines.push("• Maintain consistency with previous project names and terminology");
    lines.push("• Address any warnings or constraints identified");
    lines.push("• Build upon the established technology stack when relevant");
    lines.push("");
    lines.push("╔══════════════════════════════════════════════════════════════╗");
    lines.push("║                    END OF CONTEXT PROMPT                     ║");
    lines.push("╚══════════════════════════════════════════════════════════════╝");

    return lines.join('\n');
  }, []);

  // Process with logs
  const processWithLogs = useCallback(async (text: string): Promise<{
    parsed: ParsedConversation;
    extracted: ExtractedInfo;
    enhanced: string;
    insights: AIInsight[];
    agendaItems: AgendaItem[];
  }> => {
    setProcessingLogs([]);
    setIsProcessing(true);
    setCurrentStep(0);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const workspace = activeWorkspace;

    // Step 1: Memory Access
    setCurrentStep(1);
    const step1Id = addLog({
      step: 1,
      type: 'memory-access',
      title: `Accessing ${workspace.name} Memory Bank`,
      content: 'Retrieving previous conversations and stored context...',
      status: 'processing',
      details: [
        `Found ${workspace.conversations.length} previous conversations`,
        `${workspace.projects.length} known projects`,
        `${workspace.technologies.length} tracked technologies`,
        `${workspace.agenda.length} agenda items`,
      ],
    });
    await delay(600);
    updateLog(step1Id, { status: 'complete' });

    // Step 2: Parsing
    setCurrentStep(2);
    const step2Id = addLog({
      step: 2,
      type: 'analysis',
      title: 'Parsing Conversation',
      content: 'Analyzing input structure and identifying speakers...',
      status: 'processing',
    });
    await delay(400);
    const parsed = parseConversation(text);
    updateLog(step2Id, { 
      status: 'complete',
      details: [
        `User message: ${parsed.user.substring(0, 50)}...`,
        parsed.assistant ? `Assistant response detected: ${parsed.assistant.substring(0, 50)}...` : 'No assistant response found',
      ],
    });

    // Step 3: Extraction
    setCurrentStep(3);
    const step3Id = addLog({
      step: 3,
      type: 'extraction',
      title: 'Extracting Information',
      content: 'Identifying projects, technologies, tasks, and entities...',
      status: 'processing',
    });
    await delay(500);
    const extracted = extractInformation(parsed);
    updateLog(step3Id, { 
      status: 'complete',
      details: [
        `Projects: ${extracted.projects.length} found`,
        `Technologies: ${extracted.technologies.length} detected`,
        `Tasks: ${extracted.tasks.length} identified`,
        `Actions: ${extracted.actions.length} recognized`,
      ],
    });

    // Step 4: AI Thinking
    setCurrentStep(4);
    const step4Id = addLog({
      step: 4,
      type: 'thought',
      title: 'AI Reasoning Process',
      content: 'Analyzing patterns and making connections...',
      status: 'processing',
    });
    await delay(700);
    updateLog(step4Id, { 
      status: 'complete',
      details: [
        `Comparing with ${workspace.conversations.length} historical conversations`,
        workspace.projects.length > 0 ? `Recent projects: ${workspace.projects.slice(-3).join(', ')}` : 'No previous projects',
        workspace.technologies.length > 0 ? `Tech stack: ${workspace.technologies.slice(-5).join(', ')}` : 'No tracked technologies',
      ],
    });

    // Step 5: Insights
    setCurrentStep(5);
    const step5Id = addLog({
      step: 5,
      type: 'insight',
      title: 'Generating Insights',
      content: 'Creating observations, recommendations, and warnings...',
      status: 'processing',
    });
    await delay(500);
    const insights = generateInsights(extracted, workspace);
    updateLog(step5Id, { 
      status: 'complete',
      details: insights.map(i => `${i.type.toUpperCase()}: ${i.content.substring(0, 60)}...`),
    });

    // Step 6: Agenda
    setCurrentStep(6);
    const step6Id = addLog({
      step: 6,
      type: 'agenda',
      title: 'Updating Agenda',
      content: 'Creating and prioritizing task items...',
      status: 'processing',
    });
    await delay(400);
    const agendaItems = createAgendaItems(extracted);
    updateLog(step6Id, { 
      status: 'complete',
      details: agendaItems.map(a => `[${a.priority.toUpperCase()}] ${a.task}`),
    });

    // Step 7: Synthesis
    setCurrentStep(7);
    const step7Id = addLog({
      step: 7,
      type: 'connection',
      title: 'Synthesizing Context',
      content: 'Building comprehensive context from all sources...',
      status: 'processing',
    });
    await delay(500);
    updateLog(step7Id, { status: 'complete' });

    // Step 8: Output
    setCurrentStep(8);
    const step8Id = addLog({
      step: 8,
      type: 'output',
      title: 'Generating Enhanced Prompt',
      content: 'Creating optimized prompt with full context...',
      status: 'processing',
    });
    await delay(400);
    const enhanced = generateEnhancedPrompt(parsed, workspace, extracted, insights);
    updateLog(step8Id, { status: 'complete' });

    setIsProcessing(false);
    return { parsed, extracted, enhanced, insights, agendaItems };
  }, [activeWorkspace, addLog, updateLog, parseConversation, extractInformation, generateInsights, createAgendaItems, generateEnhancedPrompt]);

  // Store conversation in active workspace
  const storeConversation = useCallback((
    parsed: ParsedConversation,
    extracted: ExtractedInfo,
    newInsights: AIInsight[],
    newAgendaItems: AgendaItem[]
  ) => {
    const newConversation: StoredConversation = {
      ...parsed,
      extracted,
      id: Date.now(),
    };

    setAppState(prev => {
      const newWorkspaces = prev.workspaces.map(ws => {
        if (ws.id !== prev.activeWorkspaceId) return ws;

        let conversations = [...ws.conversations, newConversation];
        if (conversations.length > 50) conversations = conversations.slice(-50);

        const existingTasks = new Set(ws.agenda.map(a => a.task.toLowerCase()));
        const uniqueAgenda = newAgendaItems.filter(a => !existingTasks.has(a.task.toLowerCase()));

        const uniqueArray = (arr: string[]) => [...new Set(arr)];

        return {
          ...ws,
          conversations,
          projects: uniqueArray([...ws.projects, ...extracted.projects]),
          technologies: uniqueArray([...ws.technologies, ...extracted.technologies]),
          tasks: uniqueArray([...ws.tasks, ...extracted.tasks]),
          names: uniqueArray([...ws.names, ...extracted.names]),
          numbers: uniqueArray([...ws.numbers, ...extracted.numbers]),
          agenda: [...ws.agenda, ...uniqueAgenda].slice(-20),
          insights: [...ws.insights, ...newInsights].slice(-50),
          updatedAt: new Date().toISOString(),
        };
      });

      const newState = { ...prev, workspaces: newWorkspaces };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Toggle agenda status
  const toggleAgendaStatus = useCallback((id: number) => {
    setAppState(prev => {
      const newWorkspaces = prev.workspaces.map(ws => {
        if (ws.id !== prev.activeWorkspaceId) return ws;
        return {
          ...ws,
          agenda: ws.agenda.map(item => {
            if (item.id !== id) return item;
            const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
            const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % 3];
            return { ...item, status: nextStatus, completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined };
          }),
        };
      });
      const newState = { ...prev, workspaces: newWorkspaces };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Remove agenda item
  const removeAgendaItem = useCallback((id: number) => {
    setAppState(prev => {
      const newWorkspaces = prev.workspaces.map(ws => {
        if (ws.id !== prev.activeWorkspaceId) return ws;
        return { ...ws, agenda: ws.agenda.filter(a => a.id !== id) };
      });
      const newState = { ...prev, workspaces: newWorkspaces };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Clear workspace memory
  const clearWorkspaceMemory = useCallback(() => {
    setAppState(prev => {
      const newWorkspaces = prev.workspaces.map(ws => {
        if (ws.id !== prev.activeWorkspaceId) return ws;
        return {
          ...ws,
          conversations: [],
          projects: [],
          tasks: [],
          technologies: [],
          names: [],
          numbers: [],
          agenda: [],
          insights: [],
          updatedAt: new Date().toISOString(),
        };
      });
      const newState = { ...prev, workspaces: newWorkspaces };
      saveState(newState);
      return newState;
    });
    setProcessingLogs([]);
  }, [saveState]);

  // Get stats for active workspace
  const getStats = useCallback(() => ({
    conversations: activeWorkspace.conversations.length,
    facts: activeWorkspace.projects.length + activeWorkspace.technologies.length + activeWorkspace.names.length,
    projects: activeWorkspace.projects.length,
    tasks: activeWorkspace.tasks.length,
    agenda: activeWorkspace.agenda.length,
    insights: activeWorkspace.insights.length,
  }), [activeWorkspace]);

  // Export workspace
  const exportWorkspace = useCallback((workspaceId: string) => {
    const workspace = appState.workspaces.find(ws => ws.id === workspaceId);
    if (!workspace) return;
    
    const data = serializeWorkspace(workspace);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.name.replace(/\s+/g, '-').toLowerCase()}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [appState.workspaces]);

  // Import workspace
  const importWorkspace = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as SerializedWorkspace;
        const workspace = deserializeWorkspace({
          ...data,
          id: generateId(),
          name: `${data.name} (Imported)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        setAppState(prev => {
          const newState = {
            ...prev,
            workspaces: [...prev.workspaces, workspace],
            activeWorkspaceId: workspace.id,
          };
          saveState(newState);
          return newState;
        });
      } catch (err) {
        alert('Failed to import workspace. Invalid file format.');
      }
    };
    reader.readAsText(file);
  }, [saveState]);

  return {
    appState,
    activeWorkspace,
    workspaces: appState.workspaces,
    processingLogs,
    isProcessing,
    currentStep,
    totalSteps: 8,
    createWorkspace,
    switchWorkspace,
    updateWorkspace,
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
  };
}
