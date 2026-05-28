import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Wrench, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Users, BarChart2, RefreshCw,
} from 'lucide-react';
import { useManutencao } from '../../context/ManutencaoContext';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  'Finalizada':    { label: 'Finalizada',    color: 'text-green-700',  bg: 'bg-green-100',  ring: 'bg-green-500' },
  'Liberada':      { label: 'Liberada',      color: 'text-blue-700',   bg: 'bg-blue-100',   ring: 'bg-blue-500' },
  'Iniciada':      { label: 'Iniciada',      color: 'text-yellow-700', bg: 'bg-yellow-100', ring: 'bg-yellow-500' },
  'Não Iniciada':  { label: 'Não Iniciada',  color: 'text-gray-600',   bg: 'bg-gray-100',   ring: 'bg-gray-400' },
  'Terminada':     { label: 'Terminada',     color: 'text-purple-700', bg: 'bg-purple-100', ring: 'bg-purple-500' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100', ring: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.ring}`} />
      {cfg.label}
    </span>
  );
}

function BarChart({ data, max, colorClass }: { data: [string, number][]; max: number; colorClass: string }) {
  return (
    <div className="space-y-2">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-28 shrink-0 truncate" title={label}>{label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full ${colorClass} transition-all`}
              style={{ width: `${Math.max(2, (count / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-10 text-right">{count.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  );
}

export default function ManutencaoDashboard() {
  const { orders, fileName, importedAt, loading, error, importFile, clearData } = useManutencao();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) importFile(file);
  }, [importFile]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importFile(file);
    e.target.value = '';
  };

  if (!orders.length && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <Wrench className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Manutenção</h1>
          <p className="text-gray-500 mt-1">Importe o relatório MI0402 do DATASUL para visualizar as ordens</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div
          className="border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">Arraste o arquivo aqui ou clique para selecionar</p>
          <p className="text-sm text-gray-400">Arquivo MI0402 (.tmp, .txt) exportado do DATASUL</p>
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
        <p className="text-gray-500">Processando arquivo, aguarde...</p>
      </div>
    );
  }

  // Compute stats
  const total = orders.length;
  const byStatus: Record<string, number> = {};
  const byFamily: Record<string, number> = {};
  const byPlanner: Record<string, number> = {};
  const byTeam: Record<string, number> = {};
  let totalHours = 0;
  let closedTasks = 0;
  let allTasks = 0;

  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    byFamily[o.family] = (byFamily[o.family] ?? 0) + 1;
    byPlanner[o.planner] = (byPlanner[o.planner] ?? 0) + 1;
    byTeam[o.team] = (byTeam[o.team] ?? 0) + 1;
    totalHours += o.totalReportedHours;
    for (const t of o.tasks) {
      allTasks++;
      if (t.closed) closedTasks++;
    }
  }

  const topFamilies = Object.entries(byFamily)
    .sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topTeams = Object.entries(byTeam)
    .filter(([k]) => k)
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topPlanners = Object.entries(byPlanner)
    .filter(([k]) => k)
    .sort((a, b) => b[1] - a[1]);

  const statusOrder = ['Finalizada', 'Liberada', 'Iniciada', 'Não Iniciada', 'Terminada'];
  const statusRows = statusOrder
    .filter(s => byStatus[s])
    .map(s => [s, byStatus[s]] as [string, number]);
  const unknownStatuses = Object.entries(byStatus)
    .filter(([k]) => !statusOrder.includes(k));
  const allStatusRows = [...statusRows, ...unknownStatuses];

  const pendingOrders = orders
    .filter(o => o.status === 'Liberada' || o.status === 'Iniciada' || o.status === 'Não Iniciada')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 10);

  const finalizadas = byStatus['Finalizada'] ?? 0;
  const pendentes = (byStatus['Liberada'] ?? 0) + (byStatus['Iniciada'] ?? 0);
  const naoIniciadas = byStatus['Não Iniciada'] ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Painel de Manutenção</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <FileText className="w-3.5 h-3.5" />
            {fileName} · Importado em {importedAt}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/manutencao/ordens')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <BarChart2 className="w-4 h-4" />
            Ver todas as ordens
          </button>
          <button
            onClick={() => { clearData(); inputRef.current?.click(); }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Novo arquivo
          </button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart2 className="w-5 h-5 text-blue-500" />}
          label="Total de Ordens"
          value={total.toLocaleString('pt-BR')}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          label="Finalizadas"
          value={finalizadas.toLocaleString('pt-BR')}
          sub={`${((finalizadas / total) * 100).toFixed(1)}%`}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
          label="Em aberto"
          value={pendentes.toLocaleString('pt-BR')}
          sub={`${((pendentes / total) * 100).toFixed(1)}%`}
          bg="bg-yellow-50"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-gray-400" />}
          label="Não Iniciadas"
          value={naoIniciadas.toLocaleString('pt-BR')}
          sub={`${((naoIniciadas / total) * 100).toFixed(1)}%`}
          bg="bg-gray-50"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
          label="Horas reportadas"
          value={totalHours.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
          bg="bg-indigo-50"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-teal-500" />}
          label="Tarefas concluídas"
          value={`${closedTasks} / ${allTasks}`}
          sub={allTasks ? `${((closedTasks / allTasks) * 100).toFixed(1)}%` : undefined}
          bg="bg-teal-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-orange-500" />}
          label="Equipes ativas"
          value={Object.keys(byTeam).filter(Boolean).length.toString()}
          bg="bg-orange-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Status distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status das Ordens</h3>
          <div className="space-y-3">
            {allStatusRows.map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              const pct = ((count / total) * 100).toFixed(1);
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <StatusBadge status={status} />
                    <span className="text-gray-500 font-medium">{count.toLocaleString('pt-BR')} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cfg?.ring ?? 'bg-gray-400'} transition-all`}
                      style={{ width: `${Math.max(1, (count / total) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top families */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Famílias</h3>
          <BarChart
            data={topFamilies}
            max={topFamilies[0]?.[1] ?? 1}
            colorClass="bg-blue-400"
          />
        </div>

        {/* Planners */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por Planejador</h3>
          <BarChart
            data={topPlanners}
            max={topPlanners[0]?.[1] ?? 1}
            colorClass="bg-indigo-400"
          />
          <div className="border-t border-gray-100 mt-4 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Equipes</h3>
            <BarChart
              data={topTeams.slice(0, 5)}
              max={topTeams[0]?.[1] ?? 1}
              colorClass="bg-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Pending orders table */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Ordens Pendentes (prioridade)</h3>
            <button
              onClick={() => navigate('/manutencao/ordens')}
              className="text-xs text-blue-600 hover:underline"
            >
              Ver todas →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500">
                  <th className="px-4 py-2.5 font-medium">Ordem</th>
                  <th className="px-4 py-2.5 font-medium">Descrição</th>
                  <th className="px-4 py-2.5 font-medium">Equipamento</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Prior.</th>
                  <th className="px-4 py-2.5 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingOrders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/manutencao/ordens?id=${o.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{o.id}</td>
                    <td className="px-4 py-2.5 text-gray-800 max-w-xs truncate" title={o.description}>
                      {o.description}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{o.equipment}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-2.5">
                      <PriorityBadge priority={o.priority} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 truncate max-w-[140px]">{o.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, bg,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: number }) {
  let cls = 'bg-gray-100 text-gray-600';
  if (priority <= 200) cls = 'bg-red-100 text-red-700';
  else if (priority <= 400) cls = 'bg-orange-100 text-orange-700';
  else if (priority <= 600) cls = 'bg-yellow-100 text-yellow-700';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {priority || '—'}
    </span>
  );
}
