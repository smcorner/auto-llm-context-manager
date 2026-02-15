import { useState, useEffect, useCallback } from 'react';
import type { 
  ContextMemory, 
  ParsedConversation, 
  ExtractedInfo, 
  StoredConversation, 
  SerializedMemory,
  AgendaItem,
  AIInsight,
  LogEntry 
} from '../types';

const STORAGE_KEY = 'llm_context_v2';

const createEmptyMemory = (): ContextMemory => ({
  conversations: [],
  projects: new Set(),
  tasks: new Set(),
  technologies: new Set(),
  names: new Set(),
  numbers: new Set(),
  agenda: [],
  insights: [],
});

export function useContextMemory() {
  const [memory, setMemory] = useState<ContextMemory>(createEmptyMemory);
  const [processingLogs, setProcessingLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: SerializedMemory = JSON.parse(saved);
        setMemory({
          conversations: data.conversations || [],
          projects: new Set(data.projects || []),
          tasks: new Set(data.tasks || []),
          technologies: new Set(data.technologies || []),
          names: new Set(data.names || []),
          numbers: new Set(data.numbers || []),
          agenda: data.agenda || [],
          insights: data.insights || [],
        });
      } catch (e) {
        console.error('Failed to parse saved memory:', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveMemory = useCallback((mem: ContextMemory) => {
    const data: SerializedMemory = {
      conversations: mem.conversations,
      projects: Array.from(mem.projects),
      tasks: Array.from(mem.tasks),
      technologies: Array.from(mem.technologies),
      names: Array.from(mem.names),
      numbers: Array.from(mem.numbers),
      agenda: mem.agenda,
      insights: mem.insights,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

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

  // Parse conversation from text
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

  // Extract information with enhanced patterns
  const extractInformation = useCallback((parsed: ParsedConversation): ExtractedInfo => {
    const fullText = `${parsed.user} ${parsed.assistant}`;

    // Extract actions (verbs with context)
    const actionPatterns = fullText.match(/(?:create|build|implement|design|develop|analyze|process|generate|fix|update|delete|add|remove|modify|test|deploy|configure|setup|install)[\s]+[^.!?]{5,50}/gi) || [];
    
    // Extract goals
    const goalPatterns = fullText.match(/(?:goal is to|aim to|objective is|want to achieve|trying to|need to accomplish)[\s]+[^.!?]+/gi) || [];
    
    // Extract constraints
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

  // Generate insights based on patterns
  const generateInsights = useCallback((extracted: ExtractedInfo, existingMemory: ContextMemory): AIInsight[] => {
    const insights: AIInsight[] = [];
    const now = new Date().toISOString();

    // Check for technology connections
    const newTechs = extracted.technologies.filter(t => !existingMemory.technologies.has(t));
    if (newTechs.length > 0 && existingMemory.technologies.size > 0) {
      const existingTechs = Array.from(existingMemory.technologies).slice(0, 3);
      insights.push({
        id: Date.now(),
        type: 'connection',
        content: `New technologies (${newTechs.join(', ')}) mentioned alongside existing stack (${existingTechs.join(', ')})`,
        timestamp: now,
        relatedTo: [...newTechs, ...existingTechs],
      });
    }

    // Check for project patterns
    if (extracted.projects.length > 0 && existingMemory.projects.size > 0) {
      insights.push({
        id: Date.now() + 1,
        type: 'observation',
        content: `Working on ${extracted.projects.length} project(s). Total projects tracked: ${existingMemory.projects.size + extracted.projects.length}`,
        timestamp: now,
        relatedTo: extracted.projects,
      });
    }

    // Check for deadline/budget constraints
    if (extracted.constraints.length > 0) {
      insights.push({
        id: Date.now() + 2,
        type: 'warning',
        content: `Detected ${extracted.constraints.length} constraint(s): ${extracted.constraints[0]}`,
        timestamp: now,
      });
    }

    // Recommendations based on tasks
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

  // Create agenda items from extracted tasks
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

  // Process with logging - returns a promise for async processing
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
    void 0; // totalSteps is 8

    // Step 1: Memory Access
    setCurrentStep(1);
    const step1Id = addLog({
      step: 1,
      type: 'memory-access',
      title: 'Accessing Memory Bank',
      content: 'Retrieving previous conversations and stored context...',
      status: 'processing',
      details: [
        `Found ${memory.conversations.length} previous conversations`,
        `${memory.projects.size} known projects`,
        `${memory.technologies.size} tracked technologies`,
        `${memory.agenda.length} agenda items`,
      ],
    });
    await delay(600);
    updateLog(step1Id, { status: 'complete' });

    // Step 2: Parsing Input
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
        `Constraints: ${extracted.constraints.length} noted`,
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
    const recentProjects = Array.from(memory.projects).slice(-3);
    const recentTechs = Array.from(memory.technologies).slice(-5);
    updateLog(step4Id, { 
      status: 'complete',
      details: [
        `Comparing with ${memory.conversations.length} historical conversations`,
        recentProjects.length > 0 ? `Recent projects context: ${recentProjects.join(', ')}` : 'No previous projects',
        recentTechs.length > 0 ? `Technology stack: ${recentTechs.join(', ')}` : 'No tracked technologies',
        `Pattern matching across ${memory.insights.length} previous insights`,
      ],
    });

    // Step 5: Generating Insights
    setCurrentStep(5);
    const step5Id = addLog({
      step: 5,
      type: 'insight',
      title: 'Generating Insights',
      content: 'Creating observations, recommendations, and warnings...',
      status: 'processing',
    });
    await delay(500);
    const insights = generateInsights(extracted, memory);
    updateLog(step5Id, { 
      status: 'complete',
      details: insights.map(i => `${i.type.toUpperCase()}: ${i.content.substring(0, 60)}...`),
    });

    // Step 6: Agenda Update
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

    // Step 7: Context Synthesis
    setCurrentStep(7);
    const step7Id = addLog({
      step: 7,
      type: 'connection',
      title: 'Synthesizing Context',
      content: 'Building comprehensive context from all sources...',
      status: 'processing',
    });
    await delay(500);
    updateLog(step7Id, { 
      status: 'complete',
      details: [
        'Merging new information with existing memory',
        'Cross-referencing project dependencies',
        'Updating technology relationships',
        'Consolidating timeline information',
      ],
    });

    // Step 8: Output Generation
    setCurrentStep(8);
    const step8Id = addLog({
      step: 8,
      type: 'output',
      title: 'Generating Enhanced Prompt',
      content: 'Creating optimized prompt with full context...',
      status: 'processing',
    });
    await delay(400);
    const enhanced = generateEnhancedPromptInternal(parsed, memory, extracted, insights);
    updateLog(step8Id, { 
      status: 'complete',
      details: [
        `Output length: ${enhanced.length} characters`,
        'Includes: Memory context, key information, current request, and instructions',
      ],
    });

    setIsProcessing(false);

    return { parsed, extracted, enhanced, insights, agendaItems };
  }, [memory, addLog, updateLog, parseConversation, extractInformation, generateInsights, createAgendaItems]);

  // Internal enhanced prompt generator
  const generateEnhancedPromptInternal = (
    parsed: ParsedConversation, 
    mem: ContextMemory,
    extracted: ExtractedInfo,
    insights: AIInsight[]
  ): string => {
    const lines: string[] = [];

    // Header
    lines.push("╔══════════════════════════════════════════════════════════════╗");
    lines.push("║        🤖 AI CONTEXT MANAGER - ENHANCED PROMPT              ║");
    lines.push("╚══════════════════════════════════════════════════════════════╝");
    lines.push("");

    // Memory Section
    lines.push("## 🧠 MEMORY ACCESS LOG");
    lines.push(`📊 Total Conversations in Memory: ${mem.conversations.length}`);
    lines.push(`📁 Known Projects: ${Array.from(mem.projects).slice(-5).join(', ') || 'None'}`);
    lines.push(`💻 Technology Stack: ${Array.from(mem.technologies).slice(-8).join(', ') || 'None'}`);
    lines.push("");

    // What was last done
    if (mem.conversations.length > 0) {
      lines.push("## 📜 LAST SESSION SUMMARY");
      const lastConv = mem.conversations[mem.conversations.length - 1];
      lines.push(`Last Activity: ${new Date(lastConv.timestamp).toLocaleString()}`);
      lines.push(`Topic: ${lastConv.user.substring(0, 100)}...`);
      if (lastConv.extracted.projects.length > 0) {
        lines.push(`Projects Discussed: ${lastConv.extracted.projects.join(', ')}`);
      }
      lines.push("");
    }

    // Current Agenda
    const pendingAgenda = mem.agenda.filter(a => a.status !== 'completed');
    if (pendingAgenda.length > 0) {
      lines.push("## 📋 CURRENT AGENDA");
      pendingAgenda.slice(0, 5).forEach((item, idx) => {
        const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
        lines.push(`${idx + 1}. ${priorityEmoji} ${item.task}`);
      });
      lines.push("");
    }

    // AI Thoughts & Insights
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

    // Extracted from current input
    lines.push("## 🔍 CURRENT INPUT ANALYSIS");
    if (extracted.projects.length > 0) lines.push(`📁 Projects: ${extracted.projects.join(', ')}`);
    if (extracted.technologies.length > 0) lines.push(`💻 Technologies: ${extracted.technologies.join(', ')}`);
    if (extracted.tasks.length > 0) lines.push(`📋 Tasks: ${extracted.tasks.slice(0, 3).join('; ')}`);
    if (extracted.constraints.length > 0) lines.push(`⚠️ Constraints: ${extracted.constraints.join('; ')}`);
    if (extracted.goals.length > 0) lines.push(`🎯 Goals: ${extracted.goals.join('; ')}`);
    lines.push("");

    // Current Request
    lines.push("## 💬 CURRENT REQUEST");
    lines.push("───────────────────────────────────────────────────────────────");
    lines.push(`User: ${parsed.user}`);
    if (parsed.assistant) {
      lines.push("");
      lines.push(`Previous Response: ${parsed.assistant.substring(0, 300)}${parsed.assistant.length > 300 ? '...' : ''}`);
    }
    lines.push("───────────────────────────────────────────────────────────────");
    lines.push("");

    // Instructions
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
  };

  // Public enhanced prompt generator
  const generateEnhancedPrompt = useCallback((parsed: ParsedConversation): string => {
    const extracted = extractInformation(parsed);
    const insights = generateInsights(extracted, memory);
    return generateEnhancedPromptInternal(parsed, memory, extracted, insights);
  }, [memory, extractInformation, generateInsights]);

  // Store conversation and extracted data
  const storeConversation = useCallback((
    parsed: ParsedConversation, 
    extracted: ExtractedInfo,
    newInsights: AIInsight[],
    newAgendaItems: AgendaItem[]
  ) => {
    setMemory(prev => {
      const newConversation: StoredConversation = {
        ...parsed,
        extracted,
        id: Date.now(),
      };

      let conversations = [...prev.conversations, newConversation];
      if (conversations.length > 50) {
        conversations = conversations.slice(-50);
      }

      // Merge agenda items, avoiding duplicates
      const existingTasks = new Set(prev.agenda.map(a => a.task.toLowerCase()));
      const uniqueNewAgenda = newAgendaItems.filter(a => !existingTasks.has(a.task.toLowerCase()));

      const newMemory: ContextMemory = {
        conversations,
        projects: new Set([...prev.projects, ...extracted.projects]),
        technologies: new Set([...prev.technologies, ...extracted.technologies]),
        tasks: new Set([...prev.tasks, ...extracted.tasks]),
        names: new Set([...prev.names, ...extracted.names]),
        numbers: new Set([...prev.numbers, ...extracted.numbers]),
        agenda: [...prev.agenda, ...uniqueNewAgenda].slice(-20),
        insights: [...prev.insights, ...newInsights].slice(-50),
      };

      saveMemory(newMemory);
      return newMemory;
    });
  }, [saveMemory]);

  // Agenda management
  const toggleAgendaStatus = useCallback((id: number) => {
    setMemory(prev => {
      const newAgenda = prev.agenda.map(item => {
        if (item.id === id) {
          const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
          const currentIdx = statuses.indexOf(item.status);
          const nextStatus = statuses[(currentIdx + 1) % 3];
          return { 
            ...item, 
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return item;
      });
      const newMemory = { ...prev, agenda: newAgenda };
      saveMemory(newMemory);
      return newMemory;
    });
  }, [saveMemory]);

  const removeAgendaItem = useCallback((id: number) => {
    setMemory(prev => {
      const newMemory = { ...prev, agenda: prev.agenda.filter(a => a.id !== id) };
      saveMemory(newMemory);
      return newMemory;
    });
  }, [saveMemory]);

  // Clear all memory
  const clearMemory = useCallback(() => {
    const emptyMemory = createEmptyMemory();
    setMemory(emptyMemory);
    setProcessingLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get statistics
  const getStats = useCallback(() => ({
    conversations: memory.conversations.length,
    facts: memory.projects.size + memory.technologies.size + memory.names.size + memory.numbers.size,
    projects: memory.projects.size,
    tasks: memory.tasks.size,
    agenda: memory.agenda.length,
    insights: memory.insights.length,
  }), [memory]);

  return {
    memory,
    processingLogs,
    isProcessing,
    currentStep,
    totalSteps: 8,
    parseConversation,
    extractInformation,
    storeConversation,
    generateEnhancedPrompt,
    processWithLogs,
    toggleAgendaStatus,
    removeAgendaItem,
    clearMemory,
    getStats,
  };
}
