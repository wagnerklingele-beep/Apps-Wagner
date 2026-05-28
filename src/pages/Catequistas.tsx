import { useState } from 'react';
import { Plus, Pencil, Trash2, UserCheck, Search, Mail, Phone } from 'lucide-react';
import { useCatequistas, useTurmas } from '../store/useStore';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Catequista } from '../types';

const emptyForm = {
  nome: '', email: '', telefone: '', nivel: '', turmasIds: [] as string[], observacoes: '',
};

export default function Catequistas() {
  const { items, add, update, remove } = useCatequistas();
  const { items: turmas } = useTurmas();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Catequista | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const filtered = items.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Catequista) => {
    setEditing(c);
    setForm({ nome: c.nome, email: c.email, telefone: c.telefone, nivel: c.nivel, turmasIds: c.turmasIds, observacoes: c.observacoes || '' });
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

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const toggleTurma = (id: string) =>
    setForm(p => ({
      ...p,
      turmasIds: p.turmasIds.includes(id) ? p.turmasIds.filter(t => t !== id) : [...p.turmasIds, id],
    }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catequistas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} catequista(s) cadastrado(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Catequista
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar catequista..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{items.length === 0 ? 'Nenhum catequista cadastrado.' : 'Nenhum resultado encontrado.'}</p>
          {items.length === 0 && <button onClick={openNew} className="mt-4 text-brand-600 text-sm hover:underline">Cadastrar primeiro catequista</button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const turmasNomes = turmas.filter(t => c.turmasIds.includes(t.id)).map(t => t.nome);
            return (
              <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{c.nome}</h3>
                    {c.nivel && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{c.nivel}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmId(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.telefone}</span>
                    </div>
                  )}
                </div>
                {turmasNomes.length > 0 && (
                  <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
                    {turmasNomes.map(n => (
                      <span key={n} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded">{n}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar Catequista' : 'Novo Catequista'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input required value={form.nome} onChange={set('nome')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={form.telefone} onChange={set('telefone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível / Formação</label>
              <input value={form.nivel} onChange={set('nivel')} placeholder="Ex: Crisma 1, Coordenador..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            {turmas.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turmas Responsável</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {turmas.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.turmasIds.includes(t.id)}
                        onChange={() => toggleTurma(t.id)}
                        className="w-4 h-4 text-brand-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{t.nome} <span className="text-gray-400">({t.nivel})</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
          message="Deseja excluir este catequista?"
          onConfirm={() => { remove(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
