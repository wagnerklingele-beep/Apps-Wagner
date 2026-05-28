import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, Search, Filter } from 'lucide-react';
import { useLancamentos, useTurmas } from '../store/useStore';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { LancamentoCaixa, TipoLancamento, CategoriaCaixa } from '../types';

const CATEGORIAS: CategoriaCaixa[] = ['Mensalidade', 'Doação', 'Material', 'Evento', 'Alimentação', 'Transporte', 'Outros'];

const emptyForm = {
  tipo: 'receita' as TipoLancamento,
  descricao: '',
  valor: '',
  data: new Date().toISOString().split('T')[0],
  categoria: 'Outros' as CategoriaCaixa,
  turmaId: '',
  observacoes: '',
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FluxoCaixa() {
  const { items, add, update, remove } = useLancamentos();
  const { items: turmas } = useTurmas();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LancamentoCaixa | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterMes, setFilterMes] = useState(new Date().toISOString().slice(0, 7));

  const filtered = items.filter(l => {
    const matchSearch = l.descricao.toLowerCase().includes(search.toLowerCase());
    const matchTipo = !filterTipo || l.tipo === filterTipo;
    const matchMes = !filterMes || l.data.startsWith(filterMes);
    return matchSearch && matchTipo && matchMes;
  });

  const sorted = [...filtered].sort((a, b) => b.data.localeCompare(a.data));

  const totalReceitas = filtered.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const totalDespesas = filtered.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (l: LancamentoCaixa) => {
    setEditing(l);
    setForm({
      tipo: l.tipo, descricao: l.descricao, valor: l.valor.toString(),
      data: l.data, categoria: l.categoria, turmaId: l.turmaId || '', observacoes: l.observacoes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(form.valor);
    if (isNaN(valor) || valor <= 0) return;
    if (editing) {
      update({ ...editing, ...form, valor });
    } else {
      add({ ...form, valor, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    }
    setModalOpen(false);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const catBadgeColor: Record<CategoriaCaixa, string> = {
    Mensalidade: 'bg-brand-100 text-brand-700',
    Doação: 'bg-purple-100 text-purple-700',
    Material: 'bg-orange-100 text-orange-700',
    Evento: 'bg-pink-100 text-pink-700',
    Alimentação: 'bg-yellow-100 text-yellow-700',
    Transporte: 'bg-gray-100 text-gray-700',
    Outros: 'bg-gray-100 text-gray-600',
  };

  // Meses disponíveis para filtro
  const meses = Array.from(new Set(items.map(l => l.data.slice(0, 7)))).sort().reverse();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fluxo de Caixa</h1>
          <p className="text-gray-500 text-sm mt-0.5">Controle de receitas e despesas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Receitas</p>
            <p className="font-bold text-emerald-600">{fmt(totalReceitas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><TrendingDown className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-xs text-gray-500">Despesas</p>
            <p className="font-bold text-red-500">{fmt(totalDespesas)}</p>
          </div>
        </div>
        <div className={`bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3 ${saldo >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
          <div className={`p-2 rounded-lg ${saldo >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <Wallet className={`w-5 h-5 ${saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo</p>
            <p className={`font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(saldo)}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar descrição..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={filterMes} onChange={e => setFilterMes(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Todos os meses</option>
            {meses.map(m => {
              const [y, mo] = m.split('-');
              const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
              return <option key={m} value={m}>{d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>;
            })}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{items.length === 0 ? 'Nenhum lançamento cadastrado.' : 'Nenhum resultado encontrado.'}</p>
          {items.length === 0 && <button onClick={openNew} className="mt-4 text-brand-600 text-sm hover:underline">Criar primeiro lançamento</button>}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Descrição</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Turma</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(l => {
                  const turma = turmas.find(t => t.id === l.turmaId);
                  return (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {l.tipo === 'receita'
                            ? <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            : <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                          }
                          <span className="font-medium text-gray-800">{l.descricao}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${catBadgeColor[l.categoria]}`}>{l.categoria}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{turma?.nome || '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${l.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(l)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmId(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar Lançamento' : 'Novo Lançamento'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <div className="grid grid-cols-2 gap-2">
                {(['receita', 'despesa'] as TipoLancamento[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, tipo: t }))}
                    className={`py-2 rounded-lg text-sm font-medium border transition-colors
                      ${form.tipo === t
                        ? t === 'receita' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {t === 'receita' ? 'Receita' : 'Despesa'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <input required value={form.descricao} onChange={set('descricao')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                <input
                  required type="number" min="0.01" step="0.01"
                  value={form.valor} onChange={set('valor')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input required type="date" value={form.data} onChange={set('data')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select value={form.categoria} onChange={set('categoria')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma (opcional)</label>
                <select value={form.turmaId} onChange={set('turmaId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">— Todas —</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-700 rounded-lg hover:bg-brand-800">Salvar</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          message="Deseja excluir este lançamento?"
          onConfirm={() => { remove(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
