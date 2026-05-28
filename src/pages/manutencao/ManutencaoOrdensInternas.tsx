import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hammer, ChevronRight, X, Layers, Tag, Settings,
  FileText, CheckCircle2, AlertCircle, ClipboardList,
} from 'lucide-react';
import { useSolicitacoes } from '../../context/SolicitacoesContext';
import type { OrdemInterna, TipoManutencao, OrdemInternaStatus } from '../../types/solicitacoes';

// ── helpers ────────────────────────────────────────────────────────────────

function prioridadeLabel(p: number): string {
  const map: Record<number, string> = {
    100: 'Urgente',
    200: 'Muito Alta',
    300: 'Alta',
    400: 'Média-Alta',
    500: 'Média',
    600: 'Média-Baixa',
    700: 'Baixa',
    800: 'Muito Baixa',
  };
  return map[p] ?? String(p);
}

function PriorityBadge({ priority }: { priority: number }) {
  let cls = 'bg-gray-100 text-gray-600';
  if (priority <= 200) cls = 'bg-red-100 text-red-700';
  else if (priority <= 400) cls = 'bg-orange-100 text-orange-700';
  else if (priority <= 600) cls = 'bg-yellow-100 text-yellow-700';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {prioridadeLabel(priority)}
    </span>
  );
}

const STATUS_CFG: Record<OrdemInternaStatus, { label: string; cls: string; dot: string }> = {
  nao_planejada: { label: 'Não Planejada', cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  planejada:     { label: 'Planejada',    cls: 'bg-brand-100 text-brand-700', dot: 'bg-brand-500' },
  liberada:      { label: 'Liberada',     cls: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
};

function StatusBadge({ status }: { status: OrdemInternaStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

const TIPO_LABEL: Record<TipoManutencao, string> = {
  corretiva:  'Corretiva',
  preventiva: 'Preventiva',
  preditiva:  'Preditiva',
  melhoria:   'Melhoria',
};

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Detail Panel ───────────────────────────────────────────────────────────

interface DetailPanelProps {
  ordem: OrdemInterna;
  onClose: () => void;
  onPlanejar: () => void;
  onLiberar: () => void;
}

function DetailPanel({ ordem: o, onClose, onPlanejar, onLiberar }: DetailPanelProps) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div>
            <p className="font-mono text-xs text-gray-500">{o.id}</p>
            <h2 className="font-semibold text-gray-900 text-sm leading-tight mt-0.5 max-w-xs truncate" title={o.descricao}>
              {o.descricao}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={o.status} />
            <PriorityBadge priority={o.prioridade} />
            <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full font-medium">
              {TIPO_LABEL[o.tipoManutencao]}
            </span>
          </div>

          {/* Asset hierarchy */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Localização</p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-semibold">Macro {o.macro}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <Tag className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-mono">{o.tag}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <Settings className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-mono">{o.equipamento}</span>
            </div>
            <p className="text-xs text-gray-500 pl-5">{o.equipamentoDescricao}</p>
            {(o.familia || o.centroCusto) && (
              <div className="flex gap-4 text-xs text-gray-500 pl-5">
                {o.familia && <span>Família: <strong className="font-mono text-gray-700">{o.familia}</strong></span>}
                {o.centroCusto && <span>CC: <strong className="text-gray-700">{o.centroCusto}</strong></span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Solicitação origem</p>
              <p className="font-mono font-medium text-brand-700">{o.solicitacaoId}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Criada em</p>
              <p className="font-medium text-gray-700">{formatDate(o.criadaEm)}</p>
            </div>
            {o.planejadaPor && (
              <div>
                <p className="text-gray-400 mb-0.5">Planejada por</p>
                <p className="font-medium text-gray-700">{o.planejadaPor}</p>
              </div>
            )}
            {o.planejadaEm && (
              <div>
                <p className="text-gray-400 mb-0.5">Planejada em</p>
                <p className="font-medium text-gray-700">{formatDate(o.planejadaEm)}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</p>
            <p className="text-sm text-gray-800">{o.descricao}</p>
          </div>

          {o.observacoes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Observações</p>
              <p className="text-sm text-gray-700">{o.observacoes}</p>
            </div>
          )}

          {/* Planning summary */}
          {o.status !== 'nao_planejada' && (
            <div className="space-y-3">
              {o.tarefas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Tarefas ({o.tarefas.length})
                  </p>
                  <div className="space-y-1.5">
                    {o.tarefas.map(t => (
                      <div key={t.seq} className="flex gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-400 shrink-0">{t.seq}.</span>
                        <span className="text-gray-700">{t.descricao}</span>
                        {t.especialidades.length > 0 && (
                          <span className="ml-auto shrink-0 text-brand-600">
                            {t.especialidades.reduce((s, e) => s + e.homens, 0)}H × {t.especialidades.reduce((s, e) => s + e.horas, 0)}h
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {o.materiais.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Materiais ({o.materiais.length})
                  </p>
                  <div className="space-y-1.5">
                    {o.materiais.map(m => (
                      <div key={m.id} className="flex gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-mono text-brand-700 shrink-0">{m.codigo}</span>
                        <span className="text-gray-700 flex-1 truncate">{m.descricao}</span>
                        <span className="text-gray-500 shrink-0">{m.quantidade} {m.unidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {o.recursos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Recursos ({o.recursos.length})
                  </p>
                  <div className="space-y-1.5">
                    {o.recursos.map(r => (
                      <div key={r.id} className="flex gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-700 flex-1">{r.descricao || r.tipo}</span>
                        <span className="text-gray-500 shrink-0">{r.quantidade} {r.unidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          {o.status === 'nao_planejada' && (
            <button
              onClick={onPlanejar}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              <ClipboardList className="w-4 h-4" /> Planejar Ordem
            </button>
          )}
          {o.status === 'planejada' && (
            <button
              onClick={onLiberar}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4" /> Liberar Ordem
            </button>
          )}
          {o.status === 'liberada' && (
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Ordem liberada para execução
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type TabFilter = 'todas' | 'nao_planejadas' | 'planejadas' | 'liberadas';

export default function ManutencaoOrdensInternas() {
  const navigate = useNavigate();
  const { ordensInternas, liberarOrdem } = useSolicitacoes();
  const [tab, setTab] = useState<TabFilter>('todas');
  const [selected, setSelected] = useState<OrdemInterna | null>(null);

  const counts = useMemo(() => ({
    todas: ordensInternas.length,
    nao_planejadas: ordensInternas.filter(o => o.status === 'nao_planejada').length,
    planejadas: ordensInternas.filter(o => o.status === 'planejada').length,
    liberadas: ordensInternas.filter(o => o.status === 'liberada').length,
  }), [ordensInternas]);

  const filtered = useMemo(() => {
    if (tab === 'todas') return ordensInternas;
    const map: Record<TabFilter, OrdemInternaStatus | ''> = {
      todas: '',
      nao_planejadas: 'nao_planejada',
      planejadas: 'planejada',
      liberadas: 'liberada',
    };
    return ordensInternas.filter(o => o.status === map[tab]);
  }, [ordensInternas, tab]);

  const TABS: { key: TabFilter; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'nao_planejadas', label: 'Não Planejadas' },
    { key: 'planejadas', label: 'Planejadas' },
    { key: 'liberadas', label: 'Liberadas' },
  ];

  function handleLiberar(ordemId: string) {
    liberarOrdem(ordemId);
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ordens Internas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ordens geradas a partir das solicitações aprovadas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-4">
          <p className="text-xs text-brand-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">{counts.todas}</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium">Não Planejadas</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{counts.nao_planejadas}</p>
        </div>
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-4">
          <p className="text-xs text-brand-600 font-medium">Planejadas</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">{counts.planejadas}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium">Liberadas</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{counts.liberadas}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-brand-600 text-brand-700'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                tab === t.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Hammer className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ordem interna encontrada</p>
            {tab === 'todas' && (
              <p className="text-xs text-gray-400 mt-1">
                Aprove e converta solicitações para gerar ordens internas
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Equipamento</th>
                  <th className="px-4 py-3 font-semibold">TAG</th>
                  <th className="px-4 py-3 font-semibold">Descrição</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Prioridade</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Origem (SS)</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(o => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800 whitespace-nowrap">{o.equipamento}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{o.tag}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={o.descricao}>{o.descricao}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{TIPO_LABEL[o.tipoManutencao]}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={o.prioridade} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-600 whitespace-nowrap">{o.solicitacaoId}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(o.criadaEm)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {o.status === 'nao_planejada' && (
                          <button
                            onClick={() => navigate(`/manutencao/planejamento/${o.id}`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 text-white text-xs rounded-lg font-medium hover:bg-brand-700"
                          >
                            <ClipboardList className="w-3.5 h-3.5" /> Planejar
                          </button>
                        )}
                        {o.status === 'planejada' && (
                          <>
                            <button
                              onClick={() => navigate(`/manutencao/planejamento/${o.id}`)}
                              className="flex items-center gap-1 px-2.5 py-1.5 border border-brand-300 text-brand-700 text-xs rounded-lg hover:bg-brand-50"
                            >
                              <FileText className="w-3.5 h-3.5" /> Ver
                            </button>
                            <button
                              onClick={() => handleLiberar(o.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs rounded-lg font-medium hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Liberar
                            </button>
                          </>
                        )}
                        {o.status === 'liberada' && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Liberada
                          </span>
                        )}
                        <button
                          onClick={() => setSelected(o)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 ml-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          ordem={selected}
          onClose={() => setSelected(null)}
          onPlanejar={() => {
            navigate(`/manutencao/planejamento/${selected.id}`);
            setSelected(null);
          }}
          onLiberar={() => {
            handleLiberar(selected.id);
          }}
        />
      )}
    </div>
  );
}
