import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, AlertCircle,
  Package, ChevronRight, Layers, Tag, Settings,
  ClipboardList,
} from 'lucide-react';
import { useSolicitacoes } from '../../context/SolicitacoesContext';
import type {
  TarefaPlanejada, EspecialidadeTarefa, MaterialOrdem, RecursoAdicional, TipoRecurso,
} from '../../types/solicitacoes';
import type { AssetMacro, Component } from '../../types/assets';

// ── Constants ──────────────────────────────────────────────────────────────

const ESPECIALIDADES: { codigo: string; descricao: string }[] = [
  { codigo: 'MEC', descricao: 'Mecânico - Manutenção' },
  { codigo: 'EIA', descricao: 'Técnico - Manutenção EIA (Elétrica Industrial A)' },
  { codigo: 'EIB', descricao: 'Técnico - Manutenção EIB (Elétrica Industrial B)' },
  { codigo: 'SOL', descricao: 'Soldador' },
  { codigo: 'CLD', descricao: 'Caldereiro' },
  { codigo: 'CAR', descricao: 'Carpinteiro' },
  { codigo: 'INS', descricao: 'Instrumentista' },
  { codigo: 'LUB', descricao: 'Lubrificador' },
  { codigo: 'PNT', descricao: 'Pintor' },
  { codigo: 'CAL', descricao: 'Caldeirista' },
];

const TIPO_RECURSO_LABEL: Record<TipoRecurso, string> = {
  munck:                'Munck',
  plataforma_elevatoria: 'Plataforma Elevatória',
  hxh_terceiro:         'HxH Terceiro',
  outro:                'Outro',
};

const TIPO_MANUTENCAO_LABEL: Record<string, string> = {
  corretiva:  'Corretiva',
  preventiva: 'Preventiva',
  preditiva:  'Preditiva',
  melhoria:   'Melhoria',
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
  );
}

// ── Tarefas Section ────────────────────────────────────────────────────────

interface TarefasProps {
  tarefas: TarefaPlanejada[];
  onChange: (t: TarefaPlanejada[]) => void;
}

function TarefasSection({ tarefas, onChange }: TarefasProps) {
  function addTarefa() {
    const seq = tarefas.length + 1;
    onChange([...tarefas, { seq, descricao: '', especialidades: [] }]);
  }

  function removeTarefa(seq: number) {
    const updated = tarefas
      .filter(t => t.seq !== seq)
      .map((t, i) => ({ ...t, seq: i + 1 }));
    onChange(updated);
  }

  function updateTarefa(seq: number, descricao: string) {
    onChange(tarefas.map(t => t.seq === seq ? { ...t, descricao } : t));
  }

  function addEspecialidade(seq: number) {
    onChange(tarefas.map(t => {
      if (t.seq !== seq) return t;
      const nova: EspecialidadeTarefa = { codigo: 'MEC', descricao: 'Mecânico - Manutenção', homens: 1, horas: 1 };
      return { ...t, especialidades: [...t.especialidades, nova] };
    }));
  }

  function updateEspecialidade(seq: number, idx: number, field: keyof EspecialidadeTarefa, value: string | number) {
    onChange(tarefas.map(t => {
      if (t.seq !== seq) return t;
      const especialidades = t.especialidades.map((e, i) => {
        if (i !== idx) return e;
        if (field === 'codigo') {
          const ref = ESPECIALIDADES.find(x => x.codigo === value);
          return { ...e, codigo: String(value), descricao: ref?.descricao ?? String(value) };
        }
        return { ...e, [field]: value };
      });
      return { ...t, especialidades };
    }));
  }

  function removeEspecialidade(seq: number, idx: number) {
    onChange(tarefas.map(t =>
      t.seq === seq
        ? { ...t, especialidades: t.especialidades.filter((_, i) => i !== idx) }
        : t
    ));
  }

  return (
    <div>
      <SectionHeader
        title="Tarefas Planejadas"
        action={
          <button
            type="button"
            onClick={addTarefa}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Tarefa
          </button>
        }
      />

      {tarefas.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400">
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Nenhuma tarefa adicionada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tarefas.map(tarefa => (
            <div key={tarefa.seq} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Tarefa header */}
              <div className="flex items-start gap-3 p-3 bg-gray-50">
                <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0 mt-0.5">
                  {tarefa.seq}
                </div>
                <input
                  type="text"
                  value={tarefa.descricao}
                  onChange={e => updateTarefa(tarefa.seq, e.target.value)}
                  placeholder="Descrição da tarefa..."
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeTarefa(tarefa.seq)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Especialidades */}
              <div className="px-3 pb-3 pt-2">
                {tarefa.especialidades.length > 0 && (
                  <div className="mb-2">
                    <div className="grid grid-cols-[120px_1fr_60px_60px_32px] gap-1.5 text-xs text-gray-400 font-medium px-1 mb-1">
                      <span>Código</span>
                      <span>Especialidade</span>
                      <span className="text-center">Homens</span>
                      <span className="text-center">Horas</span>
                      <span />
                    </div>
                    {tarefa.especialidades.map((esp, idx) => (
                      <div key={idx} className="grid grid-cols-[120px_1fr_60px_60px_32px] gap-1.5 mb-1.5 items-center">
                        <select
                          value={esp.codigo}
                          onChange={e => updateEspecialidade(tarefa.seq, idx, 'codigo', e.target.value)}
                          className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                        >
                          {ESPECIALIDADES.map(x => (
                            <option key={x.codigo} value={x.codigo}>{x.codigo}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={esp.descricao}
                          readOnly
                          className="px-2 py-1.5 text-xs border border-gray-100 rounded-lg bg-gray-50 text-gray-600"
                        />
                        <input
                          type="number"
                          min={1}
                          value={esp.homens}
                          onChange={e => updateEspecialidade(tarefa.seq, idx, 'homens', Number(e.target.value))}
                          className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
                        />
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={esp.horas}
                          onChange={e => updateEspecialidade(tarefa.seq, idx, 'horas', Number(e.target.value))}
                          className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => removeEspecialidade(tarefa.seq, idx)}
                          className="flex items-center justify-center w-7 h-7 hover:bg-red-50 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => addEspecialidade(tarefa.seq)}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800"
                >
                  <Plus className="w-3 h-3" /> Adicionar Especialidade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Materiais Componentes Section ──────────────────────────────────────────

interface MateriaisComponentesProps {
  components: Component[];
  selected: Set<string>;
  quantities: Record<string, number>;
  onToggle: (code: string) => void;
  onChangeQty: (code: string, qty: number) => void;
}

function MateriaisComponentesSection({
  components, selected, quantities, onToggle, onChangeQty,
}: MateriaisComponentesProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return components;
    const q = search.toLowerCase();
    return components.filter(c =>
      c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [components, search]);

  if (components.length === 0) {
    return (
      <div>
        <SectionHeader title="Materiais dos Componentes" />
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Equipamento sem componentes cadastrados</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title={`Materiais dos Componentes (${components.length})`} />
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar componente por código ou descrição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">Nenhum componente encontrado</p>
        ) : (
          filtered.map(comp => {
            const isSelected = selected.has(comp.code);
            return (
              <div
                key={comp.code}
                className={`flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-brand-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  id={`comp-${comp.code}`}
                  checked={isSelected}
                  onChange={() => onToggle(comp.code)}
                  className="w-4 h-4 accent-brand-600 shrink-0"
                />
                <label htmlFor={`comp-${comp.code}`} className="flex-1 min-w-0 cursor-pointer">
                  <p className="text-xs font-mono font-semibold text-brand-700">{comp.code}</p>
                  <p className="text-xs text-gray-600 truncate">{comp.description}</p>
                </label>
                <span className="text-xs text-gray-400 shrink-0">{comp.unit}</span>
                {isSelected && (
                  <input
                    type="number"
                    min={1}
                    value={quantities[comp.code] ?? 1}
                    onChange={e => onChangeQty(comp.code, Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {selected.size > 0 && (
        <p className="text-xs text-brand-600 mt-2">{selected.size} componente(s) selecionado(s)</p>
      )}
    </div>
  );
}

// ── Materiais Adicionais Section ───────────────────────────────────────────

interface MateriaisAdicionaisProps {
  materiais: MaterialOrdem[];
  onChange: (m: MaterialOrdem[]) => void;
}

function MateriaisAdicionaisSection({ materiais, onChange }: MateriaisAdicionaisProps) {
  const [newItem, setNewItem] = useState({ codigo: '', descricao: '', quantidade: 1, unidade: 'UN' });

  function addItem() {
    if (!newItem.codigo.trim() || !newItem.descricao.trim()) return;
    const item: MaterialOrdem = {
      id: uid(),
      ...newItem,
      origem: 'adicional',
    };
    onChange([...materiais, item]);
    setNewItem({ codigo: '', descricao: '', quantidade: 1, unidade: 'UN' });
  }

  function removeItem(id: string) {
    onChange(materiais.filter(m => m.id !== id));
  }

  const adicionais = materiais.filter(m => m.origem === 'adicional');

  return (
    <div>
      <SectionHeader title="Materiais Adicionais" />
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {adicionais.length > 0 && (
          <>
            <div className="grid grid-cols-[90px_1fr_60px_60px_36px] gap-2 px-3 py-2 bg-gray-50 text-xs text-gray-500 font-semibold">
              <span>Código</span>
              <span>Descrição</span>
              <span className="text-center">Qtd</span>
              <span className="text-center">Un</span>
              <span />
            </div>
            {adicionais.map(m => (
              <div key={m.id} className="grid grid-cols-[90px_1fr_60px_60px_36px] gap-2 px-3 py-2 border-t border-gray-100 items-center text-xs">
                <span className="font-mono text-brand-700 truncate">{m.codigo}</span>
                <span className="text-gray-700 truncate">{m.descricao}</span>
                <span className="text-center text-gray-600">{m.quantidade}</span>
                <span className="text-center text-gray-600">{m.unidade}</span>
                <button
                  type="button"
                  onClick={() => removeItem(m.id)}
                  className="flex items-center justify-center hover:bg-red-50 rounded-lg text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </>
        )}
        {/* Add row */}
        <div className="grid grid-cols-[90px_1fr_60px_60px_36px] gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50/50 items-center">
          <input
            type="text"
            placeholder="Código"
            value={newItem.codigo}
            onChange={e => setNewItem(v => ({ ...v, codigo: e.target.value }))}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <input
            type="text"
            placeholder="Descrição do material"
            value={newItem.descricao}
            onChange={e => setNewItem(v => ({ ...v, descricao: e.target.value }))}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <input
            type="number"
            min={1}
            value={newItem.quantidade}
            onChange={e => setNewItem(v => ({ ...v, quantidade: Number(e.target.value) }))}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
          />
          <input
            type="text"
            value={newItem.unidade}
            onChange={e => setNewItem(v => ({ ...v, unidade: e.target.value }))}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
          />
          <button
            type="button"
            onClick={addItem}
            className="flex items-center justify-center w-7 h-7 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Recursos Section ───────────────────────────────────────────────────────

interface RecursosProps {
  recursos: RecursoAdicional[];
  onChange: (r: RecursoAdicional[]) => void;
}

function RecursosSection({ recursos, onChange }: RecursosProps) {
  function addRecurso() {
    const novo: RecursoAdicional = {
      id: uid(),
      tipo: 'outro',
      descricao: '',
      quantidade: 1,
      unidade: 'UN',
      observacao: '',
    };
    onChange([...recursos, novo]);
  }

  function updateRecurso(id: string, field: keyof RecursoAdicional, value: string | number) {
    onChange(recursos.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function removeRecurso(id: string) {
    onChange(recursos.filter(r => r.id !== id));
  }

  return (
    <div>
      <SectionHeader
        title="Recursos Adicionais"
        action={
          <button
            type="button"
            onClick={addRecurso}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Recurso
          </button>
        }
      />

      {recursos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center text-gray-400">
          <p className="text-xs">Nenhum recurso adicional</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recursos.map(r => (
            <div key={r.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50/40">
              <div className="grid grid-cols-[160px_1fr_70px_70px] gap-2 mb-2 items-start">
                <select
                  value={r.tipo}
                  onChange={e => updateRecurso(r.id, 'tipo', e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                >
                  {(Object.keys(TIPO_RECURSO_LABEL) as TipoRecurso[]).map(k => (
                    <option key={k} value={k}>{TIPO_RECURSO_LABEL[k]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={r.descricao}
                  onChange={e => updateRecurso(r.id, 'descricao', e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Qtd"
                  value={r.quantidade}
                  onChange={e => updateRecurso(r.id, 'quantidade', Number(e.target.value))}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
                />
                <input
                  type="text"
                  placeholder="Un"
                  value={r.unidade}
                  onChange={e => updateRecurso(r.id, 'unidade', e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 text-center"
                />
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Observação (opcional)"
                  value={r.observacao}
                  onChange={e => updateRecurso(r.id, 'observacao', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button
                  type="button"
                  onClick={() => removeRecurso(r.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ManutencaoPlanejamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ordensInternas, salvarPlanejamento } = useSolicitacoes();

  const ordem = ordensInternas.find(o => o.id === id) ?? null;

  // Asset data
  const [assetData, setAssetData] = useState<AssetMacro[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Form state
  const [tarefas, setTarefas] = useState<TarefaPlanejada[]>([]);
  const [materiais, setMateriais] = useState<MaterialOrdem[]>([]);
  const [recursos, setRecursos] = useState<RecursoAdicional[]>([]);
  const [planejadaPor, setPlanejadaPor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Component selection
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [componentQtys, setComponentQtys] = useState<Record<string, number>>({});

  // Load assets
  useEffect(() => {
    fetch('/data/assets.json')
      .then(r => r.json())
      .then((d: AssetMacro[]) => { setAssetData(d); setLoadingAssets(false); })
      .catch(() => setLoadingAssets(false));
  }, []);

  // Seed form from existing planning
  useEffect(() => {
    if (!ordem) return;
    setTarefas(ordem.tarefas ?? []);
    setRecursos(ordem.recursos ?? []);
    setObservacoes(ordem.observacoes ?? '');
    setPlanejadaPor(ordem.planejadaPor ?? '');

    const adicionais = (ordem.materiais ?? []).filter(m => m.origem === 'adicional');
    setMateriais(adicionais);

    const componentes = (ordem.materiais ?? []).filter(m => m.origem === 'componente');
    const selSet = new Set(componentes.map(m => m.codigoComponente ?? m.codigo));
    const qtys: Record<string, number> = {};
    componentes.forEach(m => { qtys[m.codigoComponente ?? m.codigo] = m.quantidade; });
    setSelectedComponents(selSet);
    setComponentQtys(qtys);
  }, [ordem]);

  // Find equipment components from asset data
  const equipmentComponents = useMemo(() => {
    if (!ordem || !assetData.length) return [];
    for (const macro of assetData) {
      for (const tag of macro.tags) {
        for (const equip of tag.equipments) {
          if (equip.id === ordem.equipamento) {
            return equip.components;
          }
        }
      }
    }
    return [];
  }, [assetData, ordem]);

  function handleToggleComponent(code: string) {
    setSelectedComponents(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
        setComponentQtys(q => ({ ...q, [code]: q[code] ?? 1 }));
      }
      return next;
    });
  }

  function handleComponentQty(code: string, qty: number) {
    setComponentQtys(q => ({ ...q, [code]: qty }));
  }

  function buildMaterialsList(): MaterialOrdem[] {
    const componentMaterials: MaterialOrdem[] = [];
    selectedComponents.forEach(code => {
      const comp = equipmentComponents.find(c => c.code === code);
      if (!comp) return;
      componentMaterials.push({
        id: uid(),
        codigo: comp.code,
        descricao: comp.description,
        quantidade: componentQtys[code] ?? 1,
        unidade: comp.unit || 'UN',
        origem: 'componente',
        codigoComponente: comp.code,
      });
    });
    return [...componentMaterials, ...materiais];
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!planejadaPor.trim()) e.planejadaPor = 'Informe o responsável pelo planejamento';
    return e;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    salvarPlanejamento(id!, {
      tarefas,
      materiais: buildMaterialsList(),
      recursos,
      planejadaPor: planejadaPor.trim(),
      observacoes: observacoes.trim(),
    });
    setSaving(false);
    navigate('/manutencao/ordens-internas');
  }

  if (!ordem) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <AlertCircle className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">Ordem não encontrada</p>
        <button
          onClick={() => navigate('/manutencao/ordens-internas')}
          className="mt-4 text-sm text-brand-600 hover:underline"
        >
          Voltar para Ordens Internas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/manutencao/ordens-internas')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Planejamento de Ordem</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{ordem.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* ── LEFT PANEL ── */}
        <div className="space-y-4">
          {/* Order info card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Informações da Ordem
            </h3>

            <div className="space-y-3">
              <InfoRow label="ID" value={ordem.id} mono />
              <InfoRow
                label="Status"
                value={
                  ordem.status === 'nao_planejada' ? 'Não Planejada' :
                  ordem.status === 'planejada' ? 'Planejada' : 'Liberada'
                }
              />
              <InfoRow label="Tipo" value={TIPO_MANUTENCAO_LABEL[ordem.tipoManutencao] ?? ordem.tipoManutencao} />
              <InfoRow label="Prioridade" value={String(ordem.prioridade)} />
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Localização</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
                <Layers className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="font-semibold">Macro {ordem.macro}</span>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                <Tag className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="font-mono">{ordem.tag}</span>
                <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                <Settings className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="font-mono">{ordem.equipamento}</span>
              </div>
              <p className="text-xs text-gray-500 pl-1">{ordem.equipamentoDescricao}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                {ordem.familia && <span>Família: <strong className="font-mono text-gray-700">{ordem.familia}</strong></span>}
                {ordem.centroCusto && <span>CC: <strong className="text-gray-700">{ordem.centroCusto}</strong></span>}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descrição</p>
              <p className="text-sm text-gray-800">{ordem.descricao}</p>
            </div>
          </div>

          {/* Equipment components */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" />
              Componentes do Equipamento
            </h3>
            {loadingAssets ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
              </div>
            ) : equipmentComponents.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Nenhum componente cadastrado</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {equipmentComponents.map(c => (
                  <div key={c.code} className="flex gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="font-mono text-brand-700 shrink-0">{c.code}</span>
                    <span className="text-gray-600 flex-1 truncate">{c.description}</span>
                    <span className="text-gray-400 shrink-0">{c.quantity} {c.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
            Formulário de Planejamento
          </h3>

          {/* Responsável */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Responsável pelo Planejamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nome do planejador"
              value={planejadaPor}
              onChange={e => { setPlanejadaPor(e.target.value); setErrors(v => ({ ...v, planejadaPor: '' })); }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 ${
                errors.planejadaPor ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.planejadaPor && (
              <p className="text-xs text-red-500 mt-1">{errors.planejadaPor}</p>
            )}
          </div>

          {/* Tarefas */}
          <TarefasSection tarefas={tarefas} onChange={setTarefas} />

          {/* Materiais dos componentes */}
          {!loadingAssets && (
            <MateriaisComponentesSection
              components={equipmentComponents}
              selected={selectedComponents}
              quantities={componentQtys}
              onToggle={handleToggleComponent}
              onChangeQty={handleComponentQty}
            />
          )}

          {/* Materiais adicionais */}
          <MateriaisAdicionaisSection materiais={materiais} onChange={setMateriais} />

          {/* Recursos adicionais */}
          <RecursosSection recursos={recursos} onChange={setRecursos} />

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Observações</label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Observações sobre o planejamento..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/manutencao/ordens-internas')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" /> Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4" /> Salvar Planejamento</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-xs font-medium text-gray-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
