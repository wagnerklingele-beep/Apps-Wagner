import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import { useTurmas, useCatequistas, useCatequizandos } from '../store/useStore';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Turma, Nivel } from '../types';

const NIVEIS: Nivel[] = [
  'Iniciação Cristã 1', 'Iniciação Cristã 2', 'Iniciação Cristã 3',
  'Primeira Eucaristia', 'Pós-Eucaristia 1', 'Pós-Eucaristia 2',
  'Crisma 1', 'Crisma 2',
];

const emptyForm = {
  nome: '', nivel: NIVEIS[0] as Nivel, catequistaId: '',
  horario: '', sala: '', anoLetivo: new Date().getFullYear().toString(),
};

export default function Turmas() {
  const { items: turmas, add, update, remove } = useTurmas();
  const { items: catequistas } = useCatequistas();
  const { items: catequizandos } = useCatequizandos();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Turma) => {
    setEditing(t);
    setForm({ nome: t.nome, nivel: t.nivel, catequistaId: t.catequistaId, horario: t.horario, sala: t.sala || '', anoLetivo: t.anoLetivo });
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

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Turmas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{turmas.length} turma(s) cadastrada(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Turma
        </button>
      </div>

      {turmas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma turma cadastrada.</p>
          <button onClick={openNew} className="mt-4 text-blue-600 text-sm hover:underline">Criar primeira turma</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map(t => {
            const catequista = catequistas.find(c => c.id === t.catequistaId);
            const total = catequizandos.filter(c => c.turmaId === t.id).length;
            return (
              <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{t.nome}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t.nivel}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmId(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="text-gray-400">Catequista:</span> {catequista?.nome || '—'}</p>
                  <p><span className="text-gray-400">Horário:</span> {t.horario || '—'}</p>
                  {t.sala && <p><span className="text-gray-400">Sala:</span> {t.sala}</p>}
                  <p><span className="text-gray-400">Ano Letivo:</span> {t.anoLetivo}</p>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center gap-1.5 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{total} catequizando(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Editar Turma' : 'Nova Turma'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma *</label>
              <input required value={form.nome} onChange={set('nome')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível *</label>
              <select required value={form.nivel} onChange={set('nivel')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catequista</label>
              <select value={form.catequistaId} onChange={set('catequistaId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Selecione —</option>
                {catequistas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <input value={form.horario} onChange={set('horario')} placeholder="Ex: Sábado 09h" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                <input value={form.sala} onChange={set('sala')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano Letivo *</label>
              <input required value={form.anoLetivo} onChange={set('anoLetivo')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800">Salvar</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          message="Deseja excluir esta turma? Catequizandos vinculados perderão o vínculo."
          onConfirm={() => { remove(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
