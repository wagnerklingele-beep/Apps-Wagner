import { useState } from 'react';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
import { useCatequizandos, useTurmas } from '../store/useStore';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Catequizando } from '../types';

const emptyForm = {
  nome: '', dataNascimento: '', turmaId: '',
  responsavel: '', telefoneResponsavel: '', email: '', endereco: '', observacoes: '',
};

export default function Catequizandos() {
  const { items, add, update, remove } = useCatequizandos();
  const { items: turmas } = useTurmas();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Catequizando | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterTurma, setFilterTurma] = useState('');

  const filtered = items.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.responsavel.toLowerCase().includes(search.toLowerCase());
    const matchTurma = !filterTurma || c.turmaId === filterTurma;
    return matchSearch && matchTurma;
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Catequizando) => {
    setEditing(c);
    setForm({
      nome: c.nome, dataNascimento: c.dataNascimento, turmaId: c.turmaId,
      responsavel: c.responsavel, telefoneResponsavel: c.telefoneResponsavel,
      email: c.email || '', endereco: c.endereco || '', observacoes: c.observacoes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      update({ ...editing, ...form });
    } else {
      add({ ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    }
    setModalOpen(false);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const turmaName = (id: string) => turmas.find(t => t.id === id)?.nome || '—';

  const calcIdade = (data: string) => {
    if (!data) return '';
    const diff = Date.now() - new Date(data).getTime();
    return `${Math.floor(diff / (365.25 * 24 * 3600 * 1000))} anos`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catequizandos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} aluno(s) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Catequizando
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou responsável..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select value={filterTurma} onChange={e => setFilterTurma(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{items.length === 0 ? 'Nenhum catequizando cadastrado.' : 'Nenhum resultado encontrado.'}</p>
          {items.length === 0 && <button onClick={openNew} className="mt-4 text-brand-600 text-sm hover:underline">Adicionar primeiro catequizando</button>}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Turma</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Idade</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Responsável</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Telefone</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs">{turmaName(c.turmaId)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{calcIdade(c.dataNascimento)}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.responsavel}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.telefoneResponsavel}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmId(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar Catequizando' : 'Novo Catequizando'} onClose={() => setModalOpen(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input required value={form.nome} onChange={set('nome')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input type="date" value={form.dataNascimento} onChange={set('dataNascimento')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select value={form.turmaId} onChange={set('turmaId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">— Selecione —</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                <input required value={form.responsavel} onChange={set('responsavel')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Responsável *</label>
                <input required value={form.telefoneResponsavel} onChange={set('telefoneResponsavel')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input value={form.endereco} onChange={set('endereco')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
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
          message="Deseja excluir este catequizando?"
          onConfirm={() => { remove(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
