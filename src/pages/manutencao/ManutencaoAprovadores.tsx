import { useState } from 'react';
import {
  UserCheck2, Plus, Pencil, Trash2, X, AlertCircle, Check,
} from 'lucide-react';
import { useSolicitacoes } from '../../context/SolicitacoesContext';
import type { Aprovador } from '../../types/solicitacoes';

// ── Tag Input ──────────────────────────────────────────────────────────────

function TeamTagInput({
  equipes,
  onChange,
}: {
  equipes: string[];
  onChange: (e: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function addEquipe() {
    const v = input.trim().toUpperCase();
    if (!v || equipes.includes(v)) { setInput(''); return; }
    onChange([...equipes, v]);
    setInput('');
  }

  function removeEquipe(eq: string) {
    onChange(equipes.filter(e => e !== eq));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addEquipe(); }
    if (e.key === 'Backspace' && input === '' && equipes.length > 0) {
      onChange(equipes.slice(0, -1));
    }
  }

  return (
    <div className="min-h-[42px] w-full flex flex-wrap gap-1.5 px-2 py-1.5 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-brand-300 bg-white">
      {equipes.map(eq => (
        <span
          key={eq}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-md"
        >
          {eq}
          <button type="button" onClick={() => removeEquipe(eq)} className="hover:text-brand-900">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addEquipe}
        placeholder={equipes.length === 0 ? 'Digite o código e pressione Enter (ex: 01-MP-01)' : ''}
        className="flex-1 min-w-[180px] text-xs outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
      />
    </div>
  );
}

// ── Form (used for both new and edit) ─────────────────────────────────────

interface AprovadorFormData {
  nome: string;
  email: string;
  equipes: string[];
  ativo: boolean;
}

interface AprovadorFormProps {
  initial: AprovadorFormData;
  onSave: (data: AprovadorFormData) => void;
  onCancel: () => void;
  title: string;
}

function AprovadorForm({ initial, onSave, onCancel, title }: AprovadorFormProps) {
  const [nome, setNome] = useState(initial.nome);
  const [email, setEmail] = useState(initial.email);
  const [equipes, setEquipes] = useState<string[]>(initial.equipes);
  const [ativo, setAtivo] = useState(initial.ativo);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Informe o nome';
    if (!email.trim()) e.email = 'Informe o e-mail';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ nome: nome.trim(), email: email.trim(), equipes, ativo });
  }

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserCheck2 className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => { setNome(e.target.value); setErrors(ev => ({ ...ev, nome: '' })); }}
              placeholder="Nome completo"
              className={inputCls('nome')}
            />
            {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(ev => ({ ...ev, email: '' })); }}
              placeholder="email@empresa.com.br"
              className={inputCls('email')}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Equipes Responsável</label>
            <TeamTagInput equipes={equipes} onChange={setEquipes} />
            <p className="text-xs text-gray-400 mt-1">Códigos das equipes que este aprovador gerencia</p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Aprovador Ativo</p>
              <p className="text-xs text-gray-400">Desative para impedir aprovações temporariamente</p>
            </div>
            <button
              type="button"
              onClick={() => setAtivo(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                ativo ? 'bg-brand-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  ativo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────

function ConfirmDeleteModal({
  aprovador,
  onConfirm,
  onCancel,
}: {
  aprovador: Aprovador;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Remover Aprovador</h3>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-5">
          Deseja remover <strong>{aprovador.nome}</strong> da lista de aprovadores?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ManutencaoAprovadores() {
  const { aprovadores, salvarAprovador, editarAprovador, removerAprovador } = useSolicitacoes();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingAprovador = aprovadores.find(a => a.id === editingId) ?? null;
  const deletingAprovador = aprovadores.find(a => a.id === deletingId) ?? null;

  function handleNew(data: Omit<Aprovador, 'id'>) {
    salvarAprovador(data);
    setShowForm(false);
  }

  function handleEdit(data: Omit<Aprovador, 'id'>) {
    if (!editingId) return;
    editarAprovador(editingId, data);
    setEditingId(null);
  }

  function handleDelete() {
    if (!deletingId) return;
    removerAprovador(deletingId);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Aprovadores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie os aprovadores de solicitações de serviço</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          Novo Aprovador
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-4">
          <p className="text-xs text-brand-600 font-medium">Total de Aprovadores</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">{aprovadores.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <p className="text-xs text-green-600 font-medium">Ativos</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{aprovadores.filter(a => a.ativo).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {aprovadores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <UserCheck2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhum aprovador cadastrado</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-brand-600 hover:underline"
            >
              Adicionar primeiro aprovador
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Equipes</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {aprovadores.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                          {a.nome.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{a.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {a.equipes.length === 0 ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          a.equipes.map(eq => (
                            <span key={eq} className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-md">
                              {eq}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <Check className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          <X className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingId(a.id)}
                          className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-600 hover:text-brand-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(a.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modals */}
      {showForm && (
        <AprovadorForm
          title="Novo Aprovador"
          initial={{ nome: '', email: '', equipes: [], ativo: true }}
          onSave={handleNew}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingAprovador && (
        <AprovadorForm
          title="Editar Aprovador"
          initial={{
            nome: editingAprovador.nome,
            email: editingAprovador.email,
            equipes: editingAprovador.equipes,
            ativo: editingAprovador.ativo,
          }}
          onSave={handleEdit}
          onCancel={() => setEditingId(null)}
        />
      )}

      {deletingAprovador && (
        <ConfirmDeleteModal
          aprovador={deletingAprovador}
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
