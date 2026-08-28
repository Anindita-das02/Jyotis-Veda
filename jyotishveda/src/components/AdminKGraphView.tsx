import React, { useState } from 'react';
import {
  Network,
  Play,
  Plus,
  Search,
  Database,
  Users,
  Terminal,
  BookOpen,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
  FileCode,
  Sliders,
  Shield,
  Activity,
} from 'lucide-react';
import { KGraphNode, KGraphEdge, RunbookConfig, UserProfile } from '../types';

interface AdminKGraphViewProps {
  nodes: KGraphNode[];
  setNodes: React.Dispatch<React.SetStateAction<KGraphNode[]>>;
  edges: KGraphEdge[];
  setEdges: React.Dispatch<React.SetStateAction<KGraphEdge[]>>;
  runbooks: RunbookConfig[];
  setRunbooks: React.Dispatch<React.SetStateAction<RunbookConfig[]>>;
  profiles: UserProfile[];
}

export const AdminKGraphView: React.FC<AdminKGraphViewProps> = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  runbooks,
  setRunbooks,
  profiles,
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'runbooks' | 'users' | 'telemetry'>('graph');
  const [selectedNode, setSelectedNode] = useState<KGraphNode | null>(nodes[0] || null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Runbook execution state
  const [executingRunbookId, setExecutingRunbookId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[INIT] Knowledge Graph Engine v2.4 initialized.',
    `[INFO] Loaded ${nodes.length} core ontology nodes and ${edges.length} astrological relationships.`,
  ]);

  // New Runbook modal
  const [isAddingRunbook, setIsAddingRunbook] = useState(false);
  const [newRunbookTitle, setNewRunbookTitle] = useState('');
  const [newRunbookDesc, setNewRunbookDesc] = useState('');
  const [newRunbookType, setNewRunbookType] = useState<RunbookConfig['type']>('user_session_ingestion');

  // Filtered nodes
  const filteredNodes = nodes.filter((n) => {
    const matchCat = categoryFilter === 'all' || n.category === categoryFilter;
    const matchSearch =
      searchQuery === '' ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sanskritName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleExecuteRunbook = async (runbook: RunbookConfig) => {
    setExecutingRunbookId(runbook.id);
    const logTimestamp = new Date().toLocaleTimeString();
    setExecutionLogs((prev) => [
      ...prev,
      `[${logTimestamp}] STARTING Runbook: "${runbook.name}" (Type: ${runbook.type})...`,
    ]);

    try {
      const res = await fetch('/api/admin/runbooks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runbookId: runbook.id,
          runbookType: runbook.type,
        }),
      });
      const data = await res.json();

      if (data.newNodes && data.newNodes.length > 0) {
        setNodes((prev) => [...prev, ...data.newNodes]);
      }
      if (data.newEdges && data.newEdges.length > 0) {
        setEdges((prev) => [...prev, ...data.newEdges]);
      }

      setRunbooks((prev) =>
        prev.map((r) =>
          r.id === runbook.id
            ? {
                ...r,
                lastRun: new Date().toISOString(),
                entitiesExtracted: r.entitiesExtracted + (data.entitiesCount || 5),
                status: 'idle',
              }
            : r
        )
      );

      setExecutionLogs((prev) => [
        ...prev,
        `[${logTimestamp}] SUCCESS: Extracted ${data.entitiesCount || 5} nodes & mapped new relationships into K-Graph.`,
      ]);
    } catch (e) {
      console.error(e);
      setExecutionLogs((prev) => [
        ...prev,
        `[${logTimestamp}] ERROR during runbook execution: ${e}`,
      ]);
    } finally {
      setExecutingRunbookId(null);
    }
  };

  const handleCreateRunbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRunbookTitle.trim()) return;

    const newR: RunbookConfig = {
      id: `rb-${Date.now()}`,
      name: newRunbookTitle.trim(),
      description: newRunbookDesc.trim() || 'Ingests domain corpora into Jyotish ontology.',
      type: newRunbookType,
      targetNodes: ['graha', 'bhava', 'yoga'],
      lastRun: 'Never',
      entitiesExtracted: 0,
      status: 'idle',
    };

    setRunbooks((prev) => [...prev, newR]);
    setIsAddingRunbook(false);
    setNewRunbookTitle('');
    setNewRunbookDesc('');
    setExecutionLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Registered new Runbook pipeline: "${newR.name}".`,
    ]);
  };

  const getNodeColor = (cat: string) => {
    switch (cat) {
      case 'planet':
        return 'bg-[#C9A050]/15 text-[#C9A050] border-[#C9A050]/40';
      case 'house':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'rashi':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'yoga':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'dosha':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'treatise':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-[#1A1A1E] text-[#9E9A90] border-[#2A2A2E]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold tracking-widest text-[#C9A050] uppercase mb-1">
              <Network className="w-4 h-4" />
              <span>Administrative Knowledge Graph & Ontology Runbooks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              AI Knowledge Graph Evolution & User Telemetry
            </h1>
            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed">
              Enrich the platform’s astrological brain by executing automated runbooks that ingest classical Sanskrit treatises and user consultation logs.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-sans">
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] px-3.5 py-1.5 rounded-lg text-center">
              <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">K-Graph Nodes</div>
              <div className="text-base font-serif font-bold text-[#C9A050]">{nodes.length}</div>
            </div>
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] px-3.5 py-1.5 rounded-lg text-center">
              <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Relationships</div>
              <div className="text-base font-serif font-bold text-[#C9A050]">{edges.length}</div>
            </div>
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] px-3.5 py-1.5 rounded-lg text-center">
              <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Active Profiles</div>
              <div className="text-base font-serif font-bold text-[#F0ECE1]">{profiles.length}</div>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex flex-wrap gap-2 pt-4 font-sans">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'graph'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Knowledge Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('runbooks')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'runbooks'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Runbooks Engine ({runbooks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'users'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Profiles & Records ({profiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & Live Terminal</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Knowledge Graph */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Node Explorer & Canvas */}
          <div className="lg:col-span-8 bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-[#9E9A90]" />
                <input
                  type="text"
                  placeholder="Search Sanskrit sutras, grahas, yogas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A1A1E] px-3 py-1.5 rounded-lg text-xs text-[#F0ECE1] border border-[#2A2A2E] focus:outline-none focus:border-[#C9A050] w-64"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1 text-xs">
                {['all', 'planet', 'house', 'rashi', 'yoga', 'dosha', 'treatise'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-[#C9A050] text-[#0D0D0F]'
                        : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nodes Grid Canvas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto p-1">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#C9A050]/20 border-[#C9A050] ring-1 ring-[#C9A050]'
                        : `${getNodeColor(n.category)} hover:border-[#9E9A90]`
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">{n.category}</span>
                        {n.sanskritName && <span className="text-[10px] text-[#C9A050] font-serif">{n.sanskritName}</span>}
                      </div>
                      <h4 className="text-xs font-serif font-bold text-[#F0ECE1] mt-1">{n.label}</h4>
                    </div>
                    <span className="text-[10px] text-[#9E9A90] mt-2 block font-mono">
                      Connections: {edges.filter((e) => e.source === n.id || e.target === n.id).length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 4 Cols: Active Node Inspector */}
          <div className="lg:col-span-4 bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4">
            {selectedNode ? (
              <div className="space-y-4 font-sans">
                <div className="pb-3 border-b border-[#2A2A2E]">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-[#C9A050] tracking-wider">
                      {selectedNode.category} Node
                    </span>
                    <span className="text-xs font-mono text-[#9E9A90]">{selectedNode.id}</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#F0ECE1] mt-1">
                    {selectedNode.label} {selectedNode.sanskritName && `(${selectedNode.sanskritName})`}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#9E9A90] block mb-1 tracking-wider">Classical Description</span>
                    <p className="text-[#E5E1D8] bg-[#1A1A1E] p-3 rounded-lg border border-[#2A2A2E] leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>

                  {selectedNode.sanskritSutra && (
                    <div className="p-3 bg-[#1A1A1E] rounded-lg border border-[#C9A050]/40">
                      <span className="text-[9px] uppercase font-bold text-[#C9A050] block mb-1 tracking-wider">Original Sanskrit Sutra</span>
                      <p className="text-[#E5E1D8] font-serif text-xs leading-relaxed">{selectedNode.sanskritSutra}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#9E9A90] block mb-1 tracking-wider">Ontological Node Properties</span>
                    <div className="bg-[#08080A] p-3 rounded-lg border border-[#2A2A2E] font-mono text-[11px] space-y-1 text-[#E5E1D8]">
                      {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-[#9E9A90]">{k}:</span>
                          <span className="text-[#C9A050]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Edges */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#9E9A90] block mb-1 tracking-wider">Associated Relationships</span>
                    <div className="space-y-1">
                      {edges
                        .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                        .map((edge) => (
                          <div
                            key={edge.id}
                            className="p-2 bg-[#1A1A1E] rounded-lg border border-[#2A2A2E] flex justify-between text-[11px]"
                          >
                            <span className="text-[#C9A050] font-semibold">{edge.relation}</span>
                            <span className="text-[#9E9A90]">
                              {edge.source === selectedNode.id ? `→ ${edge.target}` : `← ${edge.source}`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#9E9A90] text-xs font-sans">
                Select a knowledge graph node to inspect ontological sutras.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Runbooks Engine */}
      {activeTab === 'runbooks' && (
        <div className="space-y-6 font-sans">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">Automated AI Runbooks</h3>
              <p className="text-xs text-[#9E9A90]">Execute pipelines to parse Sanskrit treatises or ingest anonymized user queries</p>
            </div>
            <button
              onClick={() => setIsAddingRunbook(true)}
              className="px-3.5 py-2 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs shadow cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Runbook</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {runbooks.map((rb) => {
              const isExecuting = executingRunbookId === rb.id;
              return (
                <div
                  key={rb.id}
                  className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-5 text-[#E5E1D8] shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 rounded-lg bg-[#C9A050]/20 text-[#C9A050]">
                          <Play className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-serif font-bold text-[#F0ECE1]">{rb.name}</h4>
                          <span className="text-[10px] text-[#C9A050] font-mono">{rb.type}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1E] text-[#9E9A90] border border-[#2A2A2E]">
                        {rb.entitiesExtracted} Extracted
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9A90] mt-2.5 leading-relaxed">{rb.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#2A2A2E] flex items-center justify-between">
                    <span className="text-[11px] text-[#9E9A90] flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last Run: {rb.lastRun}</span>
                    </span>

                    <button
                      onClick={() => handleExecuteRunbook(rb)}
                      disabled={isExecuting}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1A1A1E] hover:bg-[#C9A050] hover:text-[#0D0D0F] text-[#C9A050] font-bold text-xs border border-[#C9A050]/30 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                      <span>{isExecuting ? 'Executing Pipeline...' : 'Execute Runbook'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal to Create Runbook */}
          {isAddingRunbook && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl max-w-md w-full p-6 text-[#E5E1D8] shadow-2xl space-y-4 font-sans">
                <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">Create New Knowledge Runbook</h3>
                <form onSubmit={handleCreateRunbook} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#9E9A90] font-semibold mb-1">Runbook Name</label>
                    <input
                      type="text"
                      required
                      value={newRunbookTitle}
                      onChange={(e) => setNewRunbookTitle(e.target.value)}
                      placeholder="e.g. Bhrigu Samhita Karma Extractor"
                      className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-[#F0ECE1] focus:outline-none focus:border-[#C9A050]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9E9A90] font-semibold mb-1">Pipeline Type</label>
                    <select
                      value={newRunbookType}
                      onChange={(e: any) => setNewRunbookType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-[#F0ECE1] focus:outline-none focus:border-[#C9A050]"
                    >
                      <option value="text_corpus_ingestion">Classical Text Corpus Ingestion</option>
                      <option value="user_session_ingestion">User Session Query Extractor</option>
                      <option value="ontology_enrichment">Ontology & Edge Enricher</option>
                      <option value="remedy_synthesizer">Remedy Synthesis Pipeline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#9E9A90] font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newRunbookDesc}
                      onChange={(e) => setNewRunbookDesc(e.target.value)}
                      placeholder="e.g. Ingests karmic conjunctions from ancient manuscripts..."
                      className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg text-[#F0ECE1] focus:outline-none focus:border-[#C9A050]"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingRunbook(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold"
                    >
                      Save Runbook
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Profiles & Recorded Data */}
      {activeTab === 'users' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4 font-sans">
          <div className="flex justify-between items-center pb-3 border-b border-[#2A2A2E]">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">Stored User Birth Charts & Data Records</h3>
              <p className="text-xs text-[#9E9A90]">All registered profiles with geographic coordinates and consultation preferences</p>
            </div>
            <span className="text-xs text-[#C9A050] font-semibold">{profiles.length} Active Records</span>
          </div>

          <div className="divide-y divide-[#2A2A2E]">
            {profiles.map((p) => (
              <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-[#F0ECE1] text-sm">{p.fullName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1A1A1E] text-[#C9A050] uppercase font-semibold border border-[#2A2A2E]">
                      {p.gender}
                    </span>
                    {p.isPremium && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#C9A050]/20 text-[#C9A050] border border-[#C9A050]/40 font-bold">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <p className="text-[#9E9A90] text-[11px] mt-0.5 font-sans">
                    Born: {p.birthDate} at {p.birthTime} • {p.birthPlace} (Lat: {p.latitude.toFixed(2)}°, Lng: {p.longitude.toFixed(2)}°)
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 sm:justify-end">
                  {p.focusAreas.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#1A1A1E] text-[#9E9A90] text-[10px] border border-[#2A2A2E]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Telemetry & Live Terminal */}
      {activeTab === 'telemetry' && (
        <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-4 font-sans">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#C9A050]" />
              <h3 className="text-sm font-bold text-[#F0ECE1]">Live Execution Terminal & AI Telemetry</h3>
            </div>
            <button
              onClick={() => setExecutionLogs([])}
              className="text-[11px] text-[#9E9A90] hover:text-[#F0ECE1] cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-[#08080A] p-4 rounded-xl border border-[#2A2A2E] font-mono text-xs text-[#C9A050] space-y-1.5 max-h-96 overflow-y-auto">
            {executionLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
