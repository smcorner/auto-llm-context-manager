export interface ParsedConversation {
  user: string;
  assistant: string;
  fullText: string;
  timestamp: string;
}

export interface ExtractedInfo {
  projects: string[];
  technologies: string[];
  tasks: string[];
  names: string[];
  numbers: string[];
  dates: string[];
  quotes: string[];
  actions: string[];
  goals: string[];
  constraints: string[];
}

export interface StoredConversation extends ParsedConversation {
  extracted: ExtractedInfo;
  id: number;
  summary?: string;
}

export interface AgendaItem {
  id: number;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface AIInsight {
  id: number;
  type: 'observation' | 'recommendation' | 'warning' | 'connection';
  content: string;
  timestamp: string;
  relatedTo?: string[];
}

export interface LogEntry {
  id: number;
  step: number;
  type: 'memory-access' | 'analysis' | 'extraction' | 'thought' | 'agenda' | 'output' | 'insight' | 'connection';
  title: string;
  content: string;
  details?: string[];
  status: 'pending' | 'processing' | 'complete';
  timestamp: Date;
  expanded?: boolean;
}

// PROJECT/WORKSPACE SUPPORT
export interface ProjectWorkspace {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  conversations: StoredConversation[];
  projects: string[];
  tasks: string[];
  technologies: string[];
  names: string[];
  numbers: string[];
  agenda: AgendaItem[];
  insights: AIInsight[];
}

export interface AppState {
  activeWorkspaceId: string;
  workspaces: ProjectWorkspace[];
}

export interface ContextMemory {
  conversations: StoredConversation[];
  projects: Set<string>;
  tasks: Set<string>;
  technologies: Set<string>;
  names: Set<string>;
  numbers: Set<string>;
  agenda: AgendaItem[];
  insights: AIInsight[];
}

export interface SerializedMemory {
  conversations: StoredConversation[];
  projects: string[];
  tasks: string[];
  technologies: string[];
  names: string[];
  numbers: string[];
  agenda: AgendaItem[];
  insights: AIInsight[];
}

export interface SerializedWorkspace {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  memory: SerializedMemory;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
  logs: LogEntry[];
}

// WORKSPACE COLORS
export const WORKSPACE_COLORS = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
];

// WORKSPACE ICONS
export const WORKSPACE_ICONS = [
  '📁', '💼', '🚀', '💻', '🎨', '📊', '🔧', '📱', 
  '🌐', '🤖', '📈', '🎯', '🔬', '📚', '🎮', '🏢'
];
