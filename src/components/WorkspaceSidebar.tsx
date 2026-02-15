import { useState } from 'react';
import type { ProjectWorkspace } from '../types';
import { WORKSPACE_COLORS, WORKSPACE_ICONS } from '../types';

interface WorkspaceSidebarProps {
  workspaces: ProjectWorkspace[];
  activeWorkspaceId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string, description: string, color: string, icon: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onImport: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  onSwitch,
  onCreate,
  onDelete,
  onDuplicate,
  onExport,
  onImport,
  isOpen,
  onClose,
}: WorkspaceSidebarProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(WORKSPACE_COLORS[0].value);
  const [newIcon, setNewIcon] = useState(WORKSPACE_ICONS[0]);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim(), newDesc.trim(), newColor, newIcon);
    setShowCreate(false);
    setNewName('');
    setNewDesc('');
    setNewColor(WORKSPACE_COLORS[0].value);
    setNewIcon(WORKSPACE_ICONS[0]);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📂 Workspaces
              </h2>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Workspace List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {workspaces.map(ws => (
              <div
                key={ws.id}
                onClick={() => {
                  onSwitch(ws.id);
                  onClose();
                }}
                onContextMenu={(e) => handleContextMenu(e, ws.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all group ${
                  ws.id === activeWorkspaceId
                    ? 'bg-slate-700 ring-2 ring-violet-500'
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: ws.color + '30' }}
                  >
                    {ws.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{ws.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{ws.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{ws.conversations.length} convs</span>
                      <span>•</span>
                      <span>{ws.projects.length} projects</span>
                    </div>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: ws.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-slate-700 space-y-2">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              ➕ New Workspace
            </button>
            
            <label className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer">
              📥 Import Workspace
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                onDuplicate(contextMenu.id);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
            >
              📋 Duplicate
            </button>
            <button
              onClick={() => {
                onExport(contextMenu.id);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
            >
              📤 Export
            </button>
            <hr className="my-2 border-slate-700" />
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this workspace?')) {
                  onDelete(contextMenu.id);
                }
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
            >
              🗑️ Delete
            </button>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Create New Workspace</h3>
              <p className="text-sm text-slate-500 mt-1">Organize your projects separately</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Icon Selection */}
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        newIcon === icon
                          ? 'bg-violet-600 ring-2 ring-violet-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewColor(color.value)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-2">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., E-commerce Project"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-2">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description of this workspace..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
