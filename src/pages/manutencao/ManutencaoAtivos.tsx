import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, ChevronDown, Layers, Tag, Settings,
  Package, X, AlertCircle, Loader2, BarChart2, Wrench, ClipboardPlus,
  FileText, Clock,
} from 'lucide-react';
import type { AssetMacro, AssetTag, Equipment, Component } from '../../types/assets';
import { useManutencao } from '../../context/ManutencaoContext';
import type { MaintenanceOrder } from '../../types/manutencao';

type SelectedItem =
  | { type: 'macro'; data: AssetMacro }
  | { type: 'tag'; data: AssetTag; macro: AssetMacro }
  | { type: 'equipment'; data: Equipment; tag: AssetTag; macro: AssetMacro };

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SituacaoBadge({ value }: { value: string }) {
  const lower = value?.toLowerCase() ?? '';
  let cls = 'bg-gray-100 text-gray-600';
  if (lower === 'ativo') cls = 'bg-green-100 text-green-700';
  else if (lower.includes('inati') || lower.includes('obsoleto')) cls = 'bg-red-100 text-red-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{value || '—'}</span>
  );
}

function CriticalidadeBadge({ value }: { value: string }) {
  const lower = value?.toLowerCase() ?? '';
  let cls = 'bg-gray-100 text-gray-500';
  if (lower === 'alta' || lower === 'crítica') cls = 'bg-red-100 text-red-700';
  else if (lower === 'média') cls = 'bg-yellow-100 text-yellow-700';
  else if (lower === 'baixa') cls = 'bg-green-100 text-green-700';
  return value ? (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{value}</span>
  ) : null;
}

function ComponentRow({ comp }: { comp: Component }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-3 py-2 text-xs text-gray-500 font-mono">{comp.seq}</td>
      <td className="px-3 py-2 text-xs font-mono text-brand-700">{comp.code}</td>
      <td className="px-3 py-2 text-sm text-gray-800">{comp.description}</td>
      <td className="px-3 py-2 text-xs text-center text-gray-700">
        {comp.quantity} {comp.unit}
      </td>
      <td className="px-3 py-2 text-xs text-center">
        <span className={`font-semibold ${Number(comp.balance) > 0 ? 'text-green-700' : 'text-red-600'}`}>
          {comp.balance || '0'}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-gray-500">{comp.location || '—'}</td>
      <td className="px-3 py-2">
        <SituacaoBadge value={comp.situation} />
      </td>
    </tr>
  );
}

const STATUS_COLORS: Record<string, string> = {
  'Finalizada': 'bg-green-100 text-green-700',
  'Liberada': 'bg-brand-100 text-brand-700',
  'Iniciada': 'bg-yellow-100 text-yellow-700',
  'Não Iniciada': 'bg-gray-100 text-gray-600',
  'Terminada': 'bg-purple-100 text-purple-700',
};

function OrderRow({ order }: { order: MaintenanceOrder }) {
  const cls = STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600';
  return (
    <div className="py-2 px-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono font-semibold text-gray-700">{order.id}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cls}`}>{order.status}</span>
      </div>
      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{order.description}</p>
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
        <span>{order.date}</span>
        <span>{order.team || '—'}</span>
        {order.altMaintenance && <span className="font-mono">{order.altMaintenance}</span>}
      </div>
    </div>
  );
}

function DetailPanel({ selected, onClose, orders, onNovaSolicitacao }: {
  selected: SelectedItem | null;
  onClose: () => void;
  orders: MaintenanceOrder[];
  onNovaSolicitacao: (equip: Equipment, tag: AssetTag, macro: AssetMacro) => void;
}) {
  const [compSearch, setCompSearch] = useState('');
  const [tab, setTab] = useState<'componentes' | 'ordens'>('componentes');

  useEffect(() => {
    setCompSearch('');
    setTab('componentes');
  }, [selected]);

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
        <Layers className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Selecione um item na árvore</p>
      </div>
    );
  }

  if (selected.type === 'macro') {
    const m = selected.data;
    const totalTags = m.tags.length;
    const totalEquips = m.tags.reduce((s, t) => s + t.equipments.length, 0);
    const totalComps = m.tags.reduce(
      (s, t) => s + t.equipments.reduce((ss, e) => ss + e.components.length, 0), 0
    );
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {m.id}
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{m.description}</p>
              <p className="text-xs text-gray-400">Macro {m.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{totalTags}</p>
            <p className="text-xs text-brand-600 mt-0.5">TAGs</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{totalEquips}</p>
            <p className="text-xs text-brand-600 mt-0.5">Equipamentos</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{totalComps}</p>
            <p className="text-xs text-brand-600 mt-0.5">Componentes</p>
          </div>
        </div>
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TAGs</p>
          <div className="space-y-1.5">
            {m.tags.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-mono font-semibold text-gray-700">{t.id}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{t.description}</p>
                </div>
                <span className="text-xs text-gray-400">{t.equipments.length} equip.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selected.type === 'tag') {
    const t = selected.data;
    const totalComps = t.equipments.reduce((s, e) => s + e.components.length, 0);
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <Tag className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{t.id}</p>
              <p className="text-xs text-gray-400 truncate max-w-[260px]">{t.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{t.equipments.length}</p>
            <p className="text-xs text-brand-600 mt-0.5">Equipamentos</p>
          </div>
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-700">{totalComps}</p>
            <p className="text-xs text-brand-600 mt-0.5">Componentes</p>
          </div>
        </div>
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Equipamentos</p>
          <div className="space-y-1.5">
            {t.equipments.map(e => (
              <div key={e.id} className="py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-semibold text-gray-700">{e.id}</p>
                  <div className="flex items-center gap-1">
                    <SituacaoBadge value={e.situation} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{e.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>Família: <span className="font-mono text-gray-600">{e.family || '—'}</span></span>
                  <span>{e.components.length} componentes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Equipment detail
  const e = selected.data;
  const equipOrders = useMemo(
    () => orders.filter(o => o.equipment === e.id || o.tag === selected.tag.id),
    [orders, e.id, selected.tag.id]
  );
  const filtered = compSearch
    ? e.components.filter(
        c =>
          c.code.toLowerCase().includes(compSearch.toLowerCase()) ||
          c.description.toLowerCase().includes(compSearch.toLowerCase())
      )
    : e.components;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-brand-100 flex items-center justify-center">
            <Settings className="w-4 h-4 text-brand-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 leading-tight truncate">{e.id}</p>
            <p className="text-xs text-gray-400 truncate">{e.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => onNovaSolicitacao(e, selected.tag, selected.macro)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            title="Nova Solicitação de Serviço"
          >
            <ClipboardPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solicitar</span>
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 pb-2 grid grid-cols-2 gap-2 text-xs border-b border-gray-50">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Wrench className="w-3.5 h-3.5 text-gray-400" />
          <span>Família: <span className="font-semibold font-mono">{e.family || '—'}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
          <span>CC: <span className="font-semibold">{e.costCenter || '—'}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Situação:</span>
          <SituacaoBadge value={e.situation} />
        </div>
        {e.criticality && (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Criticidade:</span>
            <CriticalidadeBadge value={e.criticality} />
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600">TAG: <span className="font-mono font-semibold">{selected.tag.id}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-600 font-semibold">{e.components.length} componentes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4">
        <button
          onClick={() => setTab('componentes')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors
            ${tab === 'componentes' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Package className="w-3.5 h-3.5" />
          Componentes ({e.components.length})
        </button>
        <button
          onClick={() => setTab('ordens')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors
            ${tab === 'ordens' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          Ordens ({equipOrders.length})
          {equipOrders.filter(o => o.status === 'Liberada' || o.status === 'Iniciada').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
              {equipOrders.filter(o => o.status === 'Liberada' || o.status === 'Iniciada').length}
            </span>
          )}
        </button>
      </div>

      {tab === 'componentes' && (
        <>
          {e.components.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar componente..."
                    value={compSearch}
                    onChange={e => setCompSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 text-left sticky top-0">
                      <th className="px-3 py-2 font-semibold text-gray-500 w-10">#</th>
                      <th className="px-3 py-2 font-semibold text-gray-500">Código</th>
                      <th className="px-3 py-2 font-semibold text-gray-500">Descrição</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 text-center">Qtd</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 text-center">Saldo</th>
                      <th className="px-3 py-2 font-semibold text-gray-500">Local</th>
                      <th className="px-3 py-2 font-semibold text-gray-500">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <ComponentRow key={i} comp={c} />
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-6">Nenhum componente encontrado</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Package className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Nenhum componente cadastrado</p>
            </div>
          )}
        </>
      )}

      {tab === 'ordens' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {equipOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Nenhuma ordem para este equipamento</p>
              <p className="text-xs mt-1">Importe o MI0402 para visualizar ordens</p>
            </div>
          ) : (
            equipOrders.map(o => <OrderRow key={o.id} order={o} />)
          )}
        </div>
      )}
    </div>
  );
}

interface TreeNodeMacroProps {
  macro: AssetMacro;
  searchTerm: string;
  expandedMacros: Set<string>;
  expandedTags: Set<string>;
  selectedId: string | null;
  onToggleMacro: (id: string) => void;
  onToggleTag: (id: string) => void;
  onSelectMacro: (m: AssetMacro) => void;
  onSelectTag: (t: AssetTag, m: AssetMacro) => void;
  onSelectEquip: (e: Equipment, t: AssetTag, m: AssetMacro) => void;
}

function matchesSearch(text: string, search: string) {
  return text.toLowerCase().includes(search.toLowerCase());
}

function TreeNodeMacro({
  macro, searchTerm, expandedMacros, expandedTags, selectedId,
  onToggleMacro, onToggleTag, onSelectMacro, onSelectTag, onSelectEquip,
}: TreeNodeMacroProps) {
  const isExpanded = expandedMacros.has(macro.id);

  const visibleTags = useMemo(() => {
    if (!searchTerm) return macro.tags;
    return macro.tags.filter(t =>
      matchesSearch(t.id, searchTerm) ||
      matchesSearch(t.description, searchTerm) ||
      t.equipments.some(
        e =>
          matchesSearch(e.id, searchTerm) ||
          matchesSearch(e.description, searchTerm) ||
          e.components.some(
            c =>
              matchesSearch(c.code, searchTerm) ||
              matchesSearch(c.description, searchTerm)
          )
      )
    );
  }, [macro.tags, searchTerm]);

  if (searchTerm && visibleTags.length === 0) return null;

  const totalEquips = macro.tags.reduce((s, t) => s + t.equipments.length, 0);

  return (
    <div className="mb-1">
      <button
        onClick={() => {
          onToggleMacro(macro.id);
          onSelectMacro(macro);
        }}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors
          ${selectedId === `macro-${macro.id}` ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs
          ${selectedId === `macro-${macro.id}` ? 'bg-brand-500' : 'bg-brand-100 text-brand-700'}`}>
          {macro.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${selectedId === `macro-${macro.id}` ? 'text-white' : ''}`}>
            {macro.description}
          </p>
          <p className={`text-xs ${selectedId === `macro-${macro.id}` ? 'text-brand-200' : 'text-gray-400'}`}>
            {macro.tags.length} TAGs · {totalEquips} equip.
          </p>
        </div>
        {isExpanded
          ? <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
          : <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />}
      </button>

      {isExpanded && (
        <div className="ml-4 pl-3 border-l-2 border-brand-100 mt-1 space-y-0.5">
          {visibleTags.map(tag => (
            <TreeNodeTag
              key={tag.id}
              tag={tag}
              macro={macro}
              searchTerm={searchTerm}
              expandedTags={expandedTags}
              selectedId={selectedId}
              onToggleTag={onToggleTag}
              onSelectTag={onSelectTag}
              onSelectEquip={onSelectEquip}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeTagProps {
  tag: AssetTag;
  macro: AssetMacro;
  searchTerm: string;
  expandedTags: Set<string>;
  selectedId: string | null;
  onToggleTag: (id: string) => void;
  onSelectTag: (t: AssetTag, m: AssetMacro) => void;
  onSelectEquip: (e: Equipment, t: AssetTag, m: AssetMacro) => void;
}

function TreeNodeTag({
  tag, macro, searchTerm, expandedTags, selectedId,
  onToggleTag, onSelectTag, onSelectEquip,
}: TreeNodeTagProps) {
  const isExpanded = expandedTags.has(tag.id);

  const visibleEquips = useMemo(() => {
    if (!searchTerm) return tag.equipments;
    return tag.equipments.filter(
      e =>
        matchesSearch(e.id, searchTerm) ||
        matchesSearch(e.description, searchTerm) ||
        e.components.some(
          c =>
            matchesSearch(c.code, searchTerm) ||
            matchesSearch(c.description, searchTerm)
        )
    );
  }, [tag.equipments, searchTerm]);

  if (searchTerm && !matchesSearch(tag.id, searchTerm) && !matchesSearch(tag.description, searchTerm) && visibleEquips.length === 0) {
    return null;
  }

  const isSelected = selectedId === `tag-${tag.id}`;

  return (
    <div>
      <button
        onClick={() => {
          onToggleTag(tag.id);
          onSelectTag(tag, macro);
        }}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors
          ${isSelected ? 'bg-brand-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
      >
        <Tag className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-brand-200' : 'text-brand-400'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold font-mono truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {tag.id}
          </p>
          <p className={`text-xs truncate ${isSelected ? 'text-brand-200' : 'text-gray-400'}`}>
            {tag.description}
          </p>
        </div>
        <span className={`text-xs shrink-0 ${isSelected ? 'text-brand-200' : 'text-gray-400'}`}>
          {tag.equipments.length}
        </span>
        {isExpanded
          ? <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
          : <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />}
      </button>

      {isExpanded && (
        <div className="ml-3 pl-3 border-l-2 border-brand-100 mt-0.5 space-y-0.5">
          {visibleEquips.map(equip => (
            <TreeNodeEquip
              key={equip.id}
              equip={equip}
              tag={tag}
              macro={macro}
              searchTerm={searchTerm}
              selectedId={selectedId}
              onSelectEquip={onSelectEquip}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeEquipProps {
  equip: Equipment;
  tag: AssetTag;
  macro: AssetMacro;
  searchTerm: string;
  selectedId: string | null;
  onSelectEquip: (e: Equipment, t: AssetTag, m: AssetMacro) => void;
}

function TreeNodeEquip({ equip, tag, macro, searchTerm, selectedId, onSelectEquip }: TreeNodeEquipProps) {
  if (
    searchTerm &&
    !matchesSearch(equip.id, searchTerm) &&
    !matchesSearch(equip.description, searchTerm) &&
    !equip.components.some(
      c =>
        matchesSearch(c.code, searchTerm) ||
        matchesSearch(c.description, searchTerm)
    )
  ) {
    return null;
  }

  const isSelected = selectedId === `equip-${equip.id}`;
  const lower = (equip.situation ?? '').toLowerCase();
  const dotClass = lower === 'ativo' ? 'bg-green-400' : lower.includes('inati') ? 'bg-red-400' : 'bg-gray-300';

  return (
    <button
      onClick={() => onSelectEquip(equip, tag, macro)}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors
        ${isSelected ? 'bg-brand-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-mono font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>
          {equip.id}
        </p>
        <p className={`text-xs truncate ${isSelected ? 'text-brand-200' : 'text-gray-400'}`}>
          {equip.description}
        </p>
      </div>
      {equip.components.length > 0 && (
        <span className={`text-xs shrink-0 ${isSelected ? 'text-brand-200' : 'text-gray-400'}`}>
          {equip.components.length}
        </span>
      )}
    </button>
  );
}

export default function ManutencaoAtivos() {
  const { orders } = useManutencao();
  const navigate = useNavigate();
  const [data, setData] = useState<AssetMacro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [expandedMacros, setExpandedMacros] = useState<Set<string>>(new Set());
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/data/assets.json')
      .then(r => r.json())
      .then((d: AssetMacro[]) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar os dados de ativos');
        setLoading(false);
      });
  }, []);

  // Auto-expand macros when searching
  useEffect(() => {
    if (debouncedSearch) {
      setExpandedMacros(new Set(data.map(m => m.id)));
      const tagsToExpand = new Set<string>();
      for (const macro of data) {
        for (const tag of macro.tags) {
          if (
            matchesSearch(tag.id, debouncedSearch) ||
            matchesSearch(tag.description, debouncedSearch) ||
            tag.equipments.some(
              e =>
                matchesSearch(e.id, debouncedSearch) ||
                matchesSearch(e.description, debouncedSearch)
            )
          ) {
            tagsToExpand.add(tag.id);
          }
        }
      }
      setExpandedTags(tagsToExpand);
    }
  }, [debouncedSearch, data]);

  const toggleMacro = useCallback((id: string) => {
    setExpandedMacros(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleTag = useCallback((id: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSelectMacro = useCallback((m: AssetMacro) => {
    setSelectedId(`macro-${m.id}`);
    setSelected({ type: 'macro', data: m });
  }, []);

  const handleSelectTag = useCallback((t: AssetTag, m: AssetMacro) => {
    setSelectedId(`tag-${t.id}`);
    setSelected({ type: 'tag', data: t, macro: m });
  }, []);

  const handleSelectEquip = useCallback((e: Equipment, t: AssetTag, m: AssetMacro) => {
    setSelectedId(`equip-${e.id}`);
    setSelected({ type: 'equipment', data: e, tag: t, macro: m });
  }, []);

  const clearDetail = useCallback(() => {
    setSelected(null);
    setSelectedId(null);
  }, []);

  const handleNovaSolicitacao = useCallback((equip: Equipment, tag: AssetTag, macro: AssetMacro) => {
    navigate('/manutencao/solicitacoes', {
      state: { equipamento: equip.id, equipamentoDescricao: equip.description, tag: tag.id, tagDescricao: tag.description, macro: macro.id }
    });
  }, [navigate]);

  const stats = useMemo(() => {
    if (!data.length) return null;
    const totalTags = data.reduce((s, m) => s + m.tags.length, 0);
    const totalEquips = data.reduce((s, m) => s + m.tags.reduce((ss, t) => ss + t.equipments.length, 0), 0);
    const totalComps = data.reduce(
      (s, m) => s + m.tags.reduce((ss, t) => ss + t.equipments.reduce((sss, e) => sss + e.components.length, 0), 0), 0
    );
    return { totalTags, totalEquips, totalComps };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Carregando árvore de ativos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Árvore de Ativos</h1>
          {stats && (
            <p className="text-xs text-gray-400 mt-0.5">
              {data.length} macros · {stats.totalTags.toLocaleString('pt-BR')} TAGs ·{' '}
              {stats.totalEquips.toLocaleString('pt-BR')} equipamentos ·{' '}
              {stats.totalComps.toLocaleString('pt-BR')} componentes
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left: tree panel */}
        <div className="w-80 shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar TAG, equipamento, componente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {data.map(macro => (
              <TreeNodeMacro
                key={macro.id}
                macro={macro}
                searchTerm={debouncedSearch}
                expandedMacros={expandedMacros}
                expandedTags={expandedTags}
                selectedId={selectedId}
                onToggleMacro={toggleMacro}
                onToggleTag={toggleTag}
                onSelectMacro={handleSelectMacro}
                onSelectTag={handleSelectTag}
                onSelectEquip={handleSelectEquip}
              />
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <DetailPanel
            selected={selected}
            onClose={clearDetail}
            orders={orders}
            onNovaSolicitacao={handleNovaSolicitacao}
          />
        </div>
      </div>
    </div>
  );
}
