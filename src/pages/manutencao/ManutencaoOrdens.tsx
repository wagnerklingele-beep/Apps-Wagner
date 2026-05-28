import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  CheckCircle2, Circle, Clock, Users, Package, AlertCircle,
} from 'lucide-react';
import { useManutencao } from '../../context/ManutencaoContext';
import type { MaintenanceOrder, MaintenanceTask } from '../../types/manutencao';
import { PriorityBadge } from './ManutencaoDashboard';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Finalizada':   { label: 'Finalizada',   color: 'text-green-700',  bg: 'bg-green-100' },
  'Liberada':     { label: 'Liberada',     color: 'text-brand-700',   bg: 'bg-brand-100' },
  'Iniciada':     { label: 'Iniciada',     color: 'text-yellow-700', bg: 'bg-yellow-100' },
  'Não Iniciada': { label: 'Não Iniciada', color: 'text-gray-600',   bg: 'bg-gray-100' },
  'Terminada':    { label: 'Terminada',    color: 'text-purple-700', bg: 'bg-purple-100' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

const PAGE_SIZE = 50;

type SortKey = 'id' | 'date' | 'priority' | 'status' | 'responsible';

function completionPct(o: MaintenanceOrder): number {
  if (!o.tasks.length) return o.status === 'Finalizada' ? 100 : 0;
  const sum = o.tasks.reduce((s, t) => s + t.conclusionPct, 0);
  return Math.round(sum / o.tasks.length);
}

export default function ManutencaoOrdens() {
  const { orders } = useManutencao();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFamily, setFilterFamily] = useState('');
  const [filterPlanner, setFilterPlanner] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'id', asc: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Open order from URL param
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedId(id);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const selected = selectedId ? orders.find(o => o.id === selectedId) ?? null : null;

  // Build filter option lists
  const statuses = useMemo(() => [...new Set(orders.map(o => o.status))].sort(), [orders]);
  const families = useMemo(() => [...new Set(orders.map(o => o.family))].filter(Boolean).sort(), [orders]);
  const planners = useMemo(() => [...new Set(orders.map(o => o.planner))].filter(Boolean).sort(), [orders]);
  const teams = useMemo(() => [...new Set(orders.map(o => o.team))].filter(Boolean).sort(), [orders]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = orders.filter(o => {
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterFamily && o.family !== filterFamily) return false;
      if (filterPlanner && o.planner !== filterPlanner) return false;
      if (filterTeam && o.team !== filterTeam) return false;
      if (q) {
        return (
          o.id.includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.equipment.toLowerCase().includes(q) ||
          o.responsible.toLowerCase().includes(q) ||
          o.tag.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      let va: string | number = '', vb: string | number = '';
      if (sort.key === 'id') { va = a.id; vb = b.id; }
      else if (sort.key === 'date') { va = a.date; vb = b.date; }
      else if (sort.key === 'priority') { va = a.priority; vb = b.priority; }
      else if (sort.key === 'status') { va = a.status; vb = b.status; }
      else if (sort.key === 'responsible') { va = a.responsible; vb = b.responsible; }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.asc ? cmp : -cmp;
    });

    return result;
  }, [orders, search, filterStatus, filterFamily, filterPlanner, filterTeam, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, asc: !s.asc } : { key, asc: true });
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterFamily('');
    setFilterPlanner('');
    setFilterTeam('');
    setPage(1);
  };

  const hasFilters = search || filterStatus || filterFamily || filterPlanner || filterTeam;

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p>Nenhum dado carregado. Importe um arquivo na página inicial.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main list */}
      <div className={`flex-1 min-w-0 space-y-4 ${selected ? 'hidden lg:block' : ''}`}>
        <div className="flex flex-wrap gap-2 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Pesquisar ordem, equip., responsável..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Filters */}
          <Select label="Status" value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }}>
            <option value="">Todos</option>
            {statuses.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
            ))}
          </Select>

          <Select label="Família" value={filterFamily} onChange={v => { setFilterFamily(v); setPage(1); }}>
            <option value="">Todas</option>
            {families.map(f => <option key={f} value={f}>{f}</option>)}
          </Select>

          <Select label="Planejador" value={filterPlanner} onChange={v => { setFilterPlanner(v); setPage(1); }}>
            <option value="">Todos</option>
            {planners.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>

          <Select label="Equipe" value={filterTeam} onChange={v => { setFilterTeam(v); setPage(1); }}>
            <option value="">Todas</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>

          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" /> Limpar
            </button>
          )}
        </div>

        {/* Results info */}
        <div className="text-xs text-gray-500">
          {filtered.length.toLocaleString('pt-BR')} de {orders.length.toLocaleString('pt-BR')} ordens
          {filtered.length !== orders.length && (
            <span className="ml-1 text-brand-600">(filtrado)</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 border-b border-gray-100">
                  <SortTh col="id" label="Ordem" sort={sort} onSort={toggleSort} />
                  <SortTh col="date" label="Data" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Equipamento</th>
                  <SortTh col="status" label="Status" sort={sort} onSort={toggleSort} />
                  <SortTh col="priority" label="Prior." sort={sort} onSort={toggleSort} />
                  <SortTh col="responsible" label="Responsável" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 font-medium">% Concl.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.map(o => {
                  const pct = completionPct(o);
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedId(o.id)}
                      className={`cursor-pointer transition-colors hover:bg-brand-50/50 ${selectedId === o.id ? 'bg-brand-50' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">{o.id}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-2.5 text-gray-800 max-w-xs">
                        <div className="truncate" title={o.description}>{o.description}</div>
                        {o.equipmentDescription && (
                          <div className="truncate text-xs text-gray-400 mt-0.5" title={o.equipmentDescription}>
                            {o.equipmentDescription}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{o.equipment}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-2.5"><PriorityBadge priority={o.priority} /></td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap max-w-[140px] truncate" title={o.responsible}>
                        {o.responsible}
                      </td>
                      <td className="px-4 py-2.5 w-24">
                        {o.tasks.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct === 100 ? 'bg-green-400' : 'bg-brand-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{pct}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Página {safePage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, safePage - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded ${safePage === p ? 'bg-brand-600 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function SortTh({
  col, label, sort, onSort,
}: {
  col: SortKey;
  label: string;
  sort: { key: SortKey; asc: boolean };
  onSort: (col: SortKey) => void;
}) {
  return (
    <th
      className="px-4 py-3 font-medium cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sort.key === col
          ? sort.asc ? <ChevronUp className="w-3 h-3 text-brand-500" /> : <ChevronDown className="w-3 h-3 text-brand-500" />
          : <ChevronDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  );
}

function Select({
  label, value, onChange, children,
}: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <select
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: MaintenanceOrder; onClose: () => void }) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const pct = (() => {
    if (!order.tasks.length) return order.status === 'Finalizada' ? 100 : 0;
    return Math.round(order.tasks.reduce((s, t) => s + t.conclusionPct, 0) / order.tasks.length);
  })();

  return (
    <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-fit max-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-400">{order.id}</span>
            {order.altMaintenance && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{order.altMaintenance}</span>
            )}
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">{order.description}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{order.equipmentDescription}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0 ml-2">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-5">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="Status"><StatusBadgeInline status={order.status} /></InfoItem>
          <InfoItem label="Prioridade"><PriorityBadge priority={order.priority} /></InfoItem>
          <InfoItem label="Equipamento">{order.equipment}</InfoItem>
          <InfoItem label="Família">{order.family}</InfoItem>
          <InfoItem label="Data abertura">{order.date}</InfoItem>
          {order.endDate && <InfoItem label="Término">{order.endDate}</InfoItem>}
          <InfoItem label="Equipe">{order.team || '—'}</InfoItem>
          <InfoItem label="Responsável">{order.responsible || '—'}</InfoItem>
          <InfoItem label="Planejador">{order.planner}</InfoItem>
          {order.businessUnit && <InfoItem label="Un. Negócio">{order.businessUnit}</InfoItem>}
          {order.costCenter && <InfoItem label="Centro Custo">{order.costCenter}</InfoItem>}
          {order.maintenanceType && <InfoItem label="Tp. Manutenção">{order.maintenanceType}</InfoItem>}
          {order.cause && <InfoItem label="Causa">{order.cause}</InfoItem>}
          {order.symptom && <InfoItem label="Sintoma">{order.symptom}</InfoItem>}
        </div>

        {/* Completion progress */}
        {order.tasks.length > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{order.tasks.filter(t => t.closed).length}/{order.tasks.length} tarefas concluídas</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct === 100 ? 'bg-green-400' : 'bg-brand-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {order.totalReportedHours > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {order.totalReportedHours.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}h reportadas
              </p>
            )}
          </div>
        )}

        {/* Tasks */}
        {order.tasks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tarefas</h4>
            <div className="space-y-2">
              {order.tasks.map(task => (
                <TaskCard
                  key={task.number}
                  task={task}
                  expanded={expandedTask === task.number}
                  onToggle={() => setExpandedTask(p => p === task.number ? null : task.number)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadgeInline({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <div className="text-sm text-gray-700 font-medium mt-0.5">{children}</div>
    </div>
  );
}

function TaskCard({
  task, expanded, onToggle,
}: {
  task: MaintenanceTask;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-lg border ${task.closed ? 'border-green-100 bg-green-50/40' : 'border-gray-100 bg-gray-50/50'}`}>
      <button
        className="w-full flex items-center gap-2.5 p-3 text-left"
        onClick={onToggle}
      >
        {task.closed
          ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">#{task.number}</span>
            <span className="text-xs text-gray-500">{task.specialty}</span>
            {task.closed && (
              <span className="ml-auto text-xs text-green-600 font-medium">100%</span>
            )}
            {!task.closed && task.conclusionPct > 0 && (
              <span className="ml-auto text-xs text-brand-600 font-medium">{task.conclusionPct.toFixed(0)}%</span>
            )}
          </div>
          <p className="text-sm text-gray-800 truncate mt-0.5">{task.description}</p>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
          {/* Specialty info */}
          {task.specialtyDescription && (
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">{task.specialty}</span> · {task.specialtyDescription}
              {task.workers > 0 && <span className="ml-2">· {task.workers}×</span>}
            </div>
          )}

          {/* Time */}
          {task.reportedTime > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {task.reportedTime.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}h reportadas
            </div>
          )}

          {/* Technicians */}
          {task.technicians.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                <Users className="w-3.5 h-3.5" /> Técnicos
              </div>
              <div className="space-y-1">
                {task.technicians.map((tech, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{tech.name}</span>
                    <div className="text-right text-gray-400">
                      <span className="font-mono">{tech.hours.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}h</span>
                      <span className="ml-2">{tech.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {task.materials.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                <Package className="w-3.5 h-3.5" /> Materiais
              </div>
              <div className="space-y-1">
                {task.materials.map((mat, i) => (
                  <div key={i} className="flex items-start justify-between text-xs gap-2">
                    <span className="text-gray-700 flex-1">{mat.description}</span>
                    <span className="text-gray-400 whitespace-nowrap">
                      {mat.quantity.toLocaleString('pt-BR')} {mat.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
