import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Cpu,
  Trash2,
  X,
  Check
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

const DEFAULT_LLM_TOPICS = [
  "Planets and their Own Signs (Lordships)",
  "Planets and their Exaltation (Ucha) and Debilitation (Neecha) signs",
  "Permanent Friendship, Enmity, and Neutral relationships between the 9 planets",
  "The 27 Nakshatras and their ruling planets"
];

export const AdminKGraphView: React.FC<AdminKGraphViewProps> = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  runbooks,
  setRunbooks,
  profiles,
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'runbooks' | 'llm_extractor' | 'users' | 'telemetry'>('graph');
  const [selectedNode, setSelectedNode] = useState<KGraphNode | null>(nodes[0] || null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // LLM Knowledge Extractor State
  const [isLLMModalOpen, setIsLLMModalOpen] = useState(false);
  const [llmTopics, setLlmTopics] = useState<string[]>(DEFAULT_LLM_TOPICS);
  const [newCustomTopic, setNewCustomTopic] = useState('');
  const [isGeneratingLLM, setIsGeneratingLLM] = useState(false);
  const [llmMessage, setLlmMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStats, setDbStats] = useState<{ nodes: number; relationships: number; active_profiles: number } | null>(null);

  // Runbook execution state
  const [executingRunbookId, setExecutingRunbookId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[INIT] Knowledge Graph Engine v2.5 initialized.',
    `[INFO] Loaded ${nodes.length} core ontology nodes and ${edges.length} astrological relationships.`,
    '[READY] LLM Knowledge Extractor Pipeline endpoint active: /api/knowledge/generate-from-llm'
  ]);

  // New Runbook modal
  const [isAddingRunbook, setIsAddingRunbook] = useState(false);
  const [newRunbookTitle, setNewRunbookTitle] = useState('');
  const [newRunbookDesc, setNewRunbookDesc] = useState('');
  const [newRunbookType, setNewRunbookType] = useState<RunbookConfig['type']>('user_session_ingestion');

  // Fetch real MySQL Knowledge Graph Nodes & Stats on mount
  const fetchKnowledgeGraphFromDB = async () => {
    setIsSyncing(true);
    try {
      const [nodesRes, statsRes] = await Promise.all([
        fetch('http://localhost:5001/api/knowledge-graph/nodes').catch(() => null),
        fetch('http://localhost:5001/api/knowledge-graph/stats').catch(() => null),
      ]);

      if (nodesRes && nodesRes.ok) {
        const nodesData = await nodesRes.json();
        if (nodesData.status === 'success' && Array.isArray(nodesData.data?.nodes) && nodesData.data.nodes.length > 0) {
          const dbNodes: KGraphNode[] = nodesData.data.nodes.map((n: any) => ({
            id: n.id,
            label: n.title,
            category: (n.type || 'other').toLowerCase(),
            sanskritName: n.title_native,
            description: n.description || 'Vedic ontology node.',
            properties: n.properties || {},
            sanskritSutra: n.properties?.sanskrit_sutra || ''
          }));

          const dbEdges: KGraphEdge[] = [];
          nodesData.data.nodes.forEach((n: any) => {
            if (Array.isArray(n.relationships)) {
              n.relationships.forEach((rel: any, idx: number) => {
                dbEdges.push({
                  id: `rel-${n.id}-${rel.target}-${idx}`,
                  source: n.id,
                  target: rel.target,
                  relation: rel.label,
                  weight: 1
                });
              });
            }
          });

          setNodes(dbNodes);
          setEdges(dbEdges);
          if (!selectedNode && dbNodes.length > 0) {
            setSelectedNode(dbNodes[0]);
          }

          setExecutionLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [SYNC] Successfully loaded ${dbNodes.length} nodes & ${dbEdges.length} relationships from MySQL database.`
          ]);
        }
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.status === 'success' && statsData.data) {
          setDbStats(statsData.data);
        }
      }
    } catch (e: any) {
      console.warn('Backend sync note:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeGraphFromDB();
  }, []);

  // Trigger LLM Direct Knowledge Generation (/api/knowledge/generate-from-llm)
  const handleGenerateFromLLM = async () => {
    if (llmTopics.length === 0) return;
    setIsGeneratingLLM(true);
    setLlmMessage(null);
    const timeStr = new Date().toLocaleTimeString();
    
    setExecutionLogs(prev => [
      ...prev,
      `[${timeStr}] [LLM PIPELINE] Dispatched request to /api/knowledge/generate-from-llm`,
      ...llmTopics.map((t, idx) => `  [Topic ${idx + 1}] "${t}"`)
    ]);

    try {
      const res = await fetch('http://localhost:5001/api/knowledge/generate-from-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: llmTopics })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setLlmMessage(`✅ ${data.message}`);
        setExecutionLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [LLM SUCCESS] ${data.message}`,
          `[INFO] Background extraction running. Fact entities and relationships are being stored in MySQL.`
        ]);

        // Auto-refresh after a delay
        setTimeout(() => {
          fetchKnowledgeGraphFromDB();
        }, 5000);
        setTimeout(() => {
          fetchKnowledgeGraphFromDB();
        }, 12000);
      } else {
        setLlmMessage(`❌ ${data.message || 'Failed to start generation'}`);
      }
    } catch (e: any) {
      setLlmMessage(`❌ Network error: ${e.message}`);
      setExecutionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [ERROR] LLM generation call failed: ${e.message}`
      ]);
    } finally {
      setIsGeneratingLLM(false);
    }
  };

  const handleAddTopic = () => {
    if (!newCustomTopic.trim()) return;
    if (!llmTopics.includes(newCustomTopic.trim())) {
      setLlmTopics(prev => [...prev, newCustomTopic.trim()]);
    }
    setNewCustomTopic('');
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setLlmTopics(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

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

  const getNodeColor = (category: string) => {
    switch (category) {
      case 'planet':
      case 'graha':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'sign':
      case 'rashi':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
      case 'nakshatra':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/40';
      case 'house':
      case 'bhava':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      case 'yoga':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      case 'dosha':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
      case 'treatise':
        return 'bg-[#C9A050]/15 text-[#C9A050] border-[#C9A050]/40';
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
              <span>Administrative Knowledge Graph & AI LLM Pipelines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F0ECE1]">
              AI Knowledge Graph & Pure LLM Extractor
            </h1>
            <p className="text-xs font-sans text-[#9E9A90] mt-1 leading-relaxed max-w-3xl">
              Extract astrological nodes, lordship rules, and planetary relationships directly from LLM or classical texts into the MySQL Knowledge Graph.
            </p>
          </div>

          {/* Action Buttons & Counters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-sans">
            <button
              onClick={() => setIsLLMModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#A37B2F] hover:from-[#D4AF37] hover:to-[#B58B35] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/20 flex items-center justify-center space-x-2 transition cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-[#0D0D0F]" />
              <span>✨ Generate via LLM</span>
            </button>

            <button
              onClick={fetchKnowledgeGraphFromDB}
              disabled={isSyncing}
              className="px-3 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#2A2A30] text-[#C9A050] border border-[#C9A050]/40 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              title="Sync fresh data from MySQL database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="bg-[#1A1A1E] border border-[#2A2A2E] px-3.5 py-1.5 rounded-lg text-center min-w-[70px]">
                <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Nodes</div>
                <div className="text-base font-serif font-bold text-[#C9A050]">
                  {dbStats?.nodes ?? nodes.length}
                </div>
              </div>
              <div className="bg-[#1A1A1E] border border-[#2A2A2E] px-3.5 py-1.5 rounded-lg text-center min-w-[70px]">
                <div className="text-[9px] text-[#9E9A90] uppercase font-bold tracking-wider">Edges</div>
                <div className="text-base font-serif font-bold text-[#C9A050]">
                  {dbStats?.relationships ?? edges.length}
                </div>
              </div>
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
            <span>Interactive Knowledge Graph ({nodes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('llm_extractor')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'llm_extractor'
                ? 'bg-[#C9A050] text-[#0D0D0F] shadow-sm'
                : 'bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] border border-[#2A2A2E]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>LLM Knowledge Generator</span>
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
            <span>User Profiles ({profiles.length})</span>
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

      {/* Tab 2: LLM Knowledge Generator Studio */}
      {activeTab === 'llm_extractor' && (
        <div className="space-y-6 font-sans">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-xl p-6 text-[#E5E1D8] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A2E]">
              <div>
                <div className="flex items-center space-x-2 text-[#C9A050] text-xs font-bold uppercase tracking-wider mb-1">
                  <Cpu className="w-4 h-4" />
                  <span>Direct LLM Knowledge Extractor Pipeline</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#F0ECE1]">
                  AI Vedic Fact Extraction (No PDFs Required)
                </h3>
                <p className="text-xs text-[#9E9A90] mt-1">
                  Query the LLM directly via <code className="bg-[#08080A] px-1.5 py-0.5 rounded text-[#C9A050] font-mono">/api/knowledge/generate-from-llm</code> to automatically populate MySQL nodes and relationships.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerateFromLLM}
                  disabled={isGeneratingLLM || llmTopics.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#A37B2F] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/25 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingLLM ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingLLM ? 'Generating Facts in Background...' : 'Launch LLM Extraction'}</span>
                </button>
              </div>
            </div>

            {/* Status Message Banner */}
            {llmMessage && (
              <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
                llmMessage.startsWith('✅') 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <span>{llmMessage}</span>
                <button 
                  onClick={() => setLlmMessage(null)} 
                  className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Topic Management Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A050]">
                  Active Topics for Extraction ({llmTopics.length})
                </h4>
                <button
                  onClick={() => setLlmTopics(DEFAULT_LLM_TOPICS)}
                  className="text-[11px] text-[#9E9A90] hover:text-[#C9A050] transition cursor-pointer"
                >
                  Reset Default Topics
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {llmTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-[#1A1A1E] border border-[#2A2A2E] hover:border-[#C9A050]/40 rounded-xl flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-[#E5E1D8] font-medium truncate">{topic}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveTopic(index)}
                      className="text-[#9E9A90] hover:text-rose-400 transition p-1 cursor-pointer shrink-0"
                      title="Remove Topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Topic Bar */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newCustomTopic}
                  onChange={(e) => setNewCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  placeholder="Add custom topic (e.g. 'Planetary Yogas for Wealth and Raj Yoga combinations')..."
                  className="flex-1 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2.5 text-xs text-[#F0ECE1] placeholder:text-[#6C6960] focus:outline-none focus:border-[#C9A050]"
                />
                <button
                  onClick={handleAddTopic}
                  className="px-4 py-2.5 bg-[#222228] hover:bg-[#C9A050] hover:text-[#0D0D0F] text-[#C9A050] border border-[#C9A050]/30 font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>
            </div>

            {/* Pipeline Configuration Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#2A2A2E] text-xs">
              <div className="bg-[#08080A] p-3 rounded-lg border border-[#2A2A2E]">
                <span className="text-[10px] text-[#9E9A90] uppercase font-bold block mb-1">API Target</span>
                <span className="font-mono text-[#C9A050] text-[11px]">POST /api/knowledge/generate-from-llm</span>
              </div>
              <div className="bg-[#08080A] p-3 rounded-lg border border-[#2A2A2E]">
                <span className="text-[10px] text-[#9E9A90] uppercase font-bold block mb-1">Knowledge Source</span>
                <span className="font-mono text-[#E5E1D8] text-[11px]">LLM_Internal_Knowledge</span>
              </div>
              <div className="bg-[#08080A] p-3 rounded-lg border border-[#2A2A2E]">
                <span className="text-[10px] text-[#9E9A90] uppercase font-bold block mb-1">Execution Mode</span>
                <span className="font-mono text-emerald-400 text-[11px]">Background Daemon Thread</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Runbooks Engine */}
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

      {/* Tab 4: User Profiles & Recorded Data */}
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

      {/* Tab 5: Telemetry & Live Terminal */}
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

      {/* Quick LLM Generation Modal */}
      {isLLMModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl max-w-xl w-full p-6 text-[#E5E1D8] shadow-2xl space-y-5 font-sans animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2E]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#C9A050]/20 text-[#C9A050]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#F0ECE1]">
                    Generate Knowledge via AI LLM
                  </h3>
                  <span className="text-[11px] text-[#9E9A90]">
                    Direct extraction into MySQL Knowledge Graph
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsLLMModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {llmMessage && (
              <div className={`p-3 rounded-xl border text-xs font-medium ${
                llmMessage.startsWith('✅') 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {llmMessage}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A050] uppercase tracking-wider">
                  Select / Review Topics ({llmTopics.length})
                </span>
                <button
                  onClick={() => setLlmTopics(DEFAULT_LLM_TOPICS)}
                  className="text-[10px] text-[#9E9A90] hover:text-[#C9A050] cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {llmTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="text-[#E5E1D8] font-medium truncate mr-2">
                      {idx + 1}. {topic}
                    </span>
                    <button
                      onClick={() => handleRemoveTopic(idx)}
                      className="text-[#9E9A90] hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCustomTopic}
                  onChange={(e) => setNewCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  placeholder="Add custom topic..."
                  className="flex-1 bg-[#1A1A1E] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-[#F0ECE1] placeholder:text-[#6C6960] focus:outline-none focus:border-[#C9A050]"
                />
                <button
                  onClick={handleAddTopic}
                  className="px-3 py-2 bg-[#2A2A30] hover:bg-[#C9A050] hover:text-[#0D0D0F] text-[#C9A050] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2E]">
              <button
                onClick={() => setIsLLMModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A1A1E] text-[#9E9A90] hover:text-[#F0ECE1] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleGenerateFromLLM}
                disabled={isGeneratingLLM || llmTopics.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A050] to-[#8C6B28] hover:from-[#D4AF37] hover:to-[#A37B2F] text-[#0D0D0F] font-bold text-xs shadow-lg shadow-[#C9A050]/30 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingLLM ? 'animate-spin' : ''}`} />
                <span>{isGeneratingLLM ? 'Generating...' : 'Start Extraction'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
