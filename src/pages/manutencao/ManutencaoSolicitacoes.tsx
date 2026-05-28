import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardPlus, X, CheckCircle2, XCircle, ChevronRight, AlertCircle,
  Calendar, User, Tag, Settings, Layers, FileText, Loader2, ArrowRightCircle,
} from 'lucide-react';
import { useSolicitacoes } from '../../context/SolicitacoesContext';
import type { Solicitacao, TipoManutencao } from '../../types/solicitacoes';
import type { AssetMacro, AssetTag, Equipment } from '../../types/assets';

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

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  pendente:   { label: 'Pendente',   cls: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  aprovada:   { label: 'Aprovada',   cls: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
  rejeitada:  { label: 'Rejeitada',  cls: 'bg-red-100 text-red-800',       dot: 'bg-red-500' },
  convertida: { label: 'Convertida', cls: 'bg-brand-100 text-brand-800',   dot: 'bg-brand-500' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Nova Solicitação Modal ─────────────────────────────────────────────────

interface NovaSolicitacaoModalProps {
  onClose: () => void;
}

function NovaSolicitacaoModal({ onClose }: NovaSolicitacaoModalProps) {
  const { criarSolicitacao } = useSolicitacoes();

  const [assets, setAssets] = useState<AssetMacro[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [criadaPor, setCriadaPor] = useState('');
  const [macroId, setMacroId] = useState('');
  const [tagId, setTagId] = useState('');
  const [equipId, setEquipId] = useState('');
  const [tipoManutencao, setTipoManutencao] = useState<TipoManutencao>('corretiva');
  const [prioridade, setPrioridade] = useState<number>(500);
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/data/assets.json')
      .then(r => r.json())
      .then((d: AssetMacro[]) => { setAssets(d); setLoadingAssets(false); })
      .catch(() => setLoadingAssets(false));
  }, []);

  const selectedMacro = assets.find(m => m.id === macroId) ?? null;
  const selectedTag = selectedMacro?.tags.find(t => t.id === tagId) ?? null;
  const selectedEquip = selectedTag?.equipments.find(e => e.id === equipId) ?? null;

  const availableTags: AssetTag[] = selectedMacro?.tags ?? [];
  const availableEquips: Equipment[] = selectedTag?.equipments ?? [];

  function validate() {
    const e: Record<string, string> = {};
    if (!criadaPor.trim()) e.criadaPor = 'Informe o solicitante';
    if (!macroId) e.macro = 'Selecione a Macro';
    if (!tagId) e.tag = 'Selecione a TAG';
    if (!equipId) e.equipamento = 'Selecione o equipamento';
    if (!descricao.trim()) e.descricao = 'Informe a descrição do serviço';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    criarSolicitacao({
      criadaPor: criadaPor.trim(),
      macro: macroId,
      tag: tagId,
      tagDescricao: selectedTag?.description ?? '',
      equipamento: equipId,
      equipamentoDescricao: selectedEquip?.description ?? '',
      familia: selectedEquip?.family ?? '',
      centroCusto: selectedEquip?.costCenter ?? '',
      descricao: descricao.trim(),
      prioridade,
      tipoManutencao,
      observacoes: observacoes.trim(),
    });
    setSubmitting(false);
    onClose();
  }

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardPlus className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-semibold text-gray-900">Nova Solicitação de Serviço</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Solicitante */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Solicitante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nome completo do solicitante"
              value={criadaPor}
              onChange={e => { setCriadaPor(e.target.value); setErrors(ev => ({ ...ev, criadaPor: '' })); }}
              className={inputCls('criadaPor')}
            />
            {errors.criadaPor && <p className="text-xs text-red-500 mt-1">{errors.criadaPor}</p>}
          </div>

          {/* Selecionar Equipamento */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Localização do Equipamento
            </p>

            {loadingAssets ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando ativos...
              </div>
            ) : (
              <>
                {/* Macro */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Macro <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={macroId}
                    onChange={e => {
                      setMacroId(e.target.value);
                      setTagId('');
                      setEquipId('');
                      setErrors(ev => ({ ...ev, macro: '' }));
                    }}
                    className={inputCls('macro')}
                  >
                    <option value="">Selecione a Macro...</option>
                    {assets.map(m => (
                      <option key={m.id} value={m.id}>{m.id} — {m.description}</option>
                    ))}
                  </select>
                  {errors.macro && <p className="text-xs text-red-500 mt-1">{errors.macro}</p>}
                </div>

                {/* TAG */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    TAG <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tagId}
                    onChange={e => {
                      setTagId(e.target.value);
                      setEquipId('');
                      setErrors(ev => ({ ...ev, tag: '' }));
                    }}
                    disabled={!macroId}
                    className={inputCls('tag') + (!macroId ? ' opacity-50 cursor-not-allowed' : '')}
                  >
                    <option value="">Selecione a TAG...</option>
                    {availableTags.map(t => (
                      <option key={t.id} value={t.id}>{t.id} — {t.description}</option>
                    ))}
                  </select>
                  {errors.tag && <p className="text-xs text-red-500 mt-1">{errors.tag}</p>}
                </div>

                {/* Equipamento */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Equipamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={equipId}
                    onChange={e => {
                      setEquipId(e.target.value);
                      setErrors(ev => ({ ...ev, equipamento: '' }));
                    }}
                    disabled={!tagId}
                    className={inputCls('equipamento') + (!tagId ? ' opacity-50 cursor-not-allowed' : '')}
                  >
                    <option value="">Selecione o Equipamento...</option>
                    {availableEquips.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.id} — {eq.description}</option>
                    ))}
                  </select>
                  {errors.equipamento && <p className="text-xs text-red-500 mt-1">{errors.equipamento}</p>}
                </div>

                {selectedEquip && (
                  <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-200 pt-2 mt-1">
                    <span>Família: <strong className="font-mono text-gray-700">{selectedEquip.family || '—'}</strong></span>
                    <span>CC: <strong className="text-gray-700">{selectedEquip.costCenter || '—'}</strong></span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tipo e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Manutenção</label>
              <select
                value={tipoManutencao}
                onChange={e => setTipoManutencao(e.target.value as TipoManutencao)}
                className={inputCls('')}
              >
                <option value="corretiva">Corretiva</option>
                <option value="preventiva">Preventiva</option>
                <option value="preditiva">Preditiva</option>
                <option value="melhoria">Melhoria</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={e => setPrioridade(Number(e.target.value))}
                className={inputCls('')}
              >
                <option value={100}>100 — Urgente</option>
                <option value={200}>200 — Muito Alta</option>
                <option value={300}>300 — Alta</option>
                <option value={400}>400 — Média-Alta</option>
                <option value={500}>500 — Média</option>
                <option value={600}>600 — Média-Baixa</option>
                <option value={700}>700 — Baixa</option>
                <option value={800}>800 — Muito Baixa</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Descrição do Serviço <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o serviço a ser executado..."
              value={descricao}
              onChange={e => { setDescricao(e.target.value); setErrors(ev => ({ ...ev, descricao: '' })); }}
              className={inputCls('descricao') + ' resize-none'}
            />
            {errors.descricao && <p className="text-xs text-red-500 mt-1">{errors.descricao}</p>}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Observações</label>
            <textarea
              rows={2}
              placeholder="Observações adicionais (opcional)..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Criar Solicitação'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Approve / Reject Modal ─────────────────────────────────────────────────

interface ActionModalProps {
  type: 'aprovar' | 'rejeitar';
  solicitacaoId: string;
  onClose: () => void;
}

function ActionModal({ type, solicitacaoId, onClose }: ActionModalProps) {
  const { aprovadores, aprovarSolicitacao, rejeitarSolicitacao } = useSolicitacoes();
  const [aprovadorId, setAprovadorId] = useState('');
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  const ativos = aprovadores.filter(a => a.ativo);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aprovadorId) { setError('Selecione um aprovador'); return; }
    if (type === 'rejeitar' && !comentario.trim()) { setError('Informe o motivo da rejeição'); return; }
    if (type === 'aprovar') {
      aprovarSolicitacao(solicitacaoId, aprovadorId, comentario.trim());
    } else {
      rejeitarSolicitacao(solicitacaoId, aprovadorId, comentario.trim());
    }
    onClose();
  }

  const isAprovar = type === 'aprovar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100`}>
          <div className="flex items-center gap-2">
            {isAprovar
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-red-600" />}
            <h2 className="text-base font-semibold text-gray-900">
              {isAprovar ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Aprovador <span className="text-red-500">*</span>
            </label>
            <select
              value={aprovadorId}
              onChange={e => { setAprovadorId(e.target.value); setError(''); }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">Selecione o aprovador...</option>
              {ativos.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isAprovar ? 'Comentário (opcional)' : 'Motivo da Rejeição'}{!isAprovar && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              rows={3}
              value={comentario}
              onChange={e => { setComentario(e.target.value); setError(''); }}
              placeholder={isAprovar ? 'Observações...' : 'Informe o motivo da rejeição...'}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-sm text-white rounded-lg font-medium ${
                isAprovar ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAprovar ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────

interface DetailPanelProps {
  solicitacao: Solicitacao;
  onClose: () => void;
  onAprovar: () => void;
  onRejeitar: () => void;
  onConverter: () => void;
}

function DetailPanel({ solicitacao: s, onClose, onAprovar, onRejeitar, onConverter }: DetailPanelProps) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div>
            <p className="font-mono text-xs text-gray-500">{s.id}</p>
            <h2 className="font-semibold text-gray-900 text-sm leading-tight mt-0.5 max-w-xs truncate" title={s.descricao}>
              {s.descricao}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Status + badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={s.status} />
            <PriorityBadge priority={s.prioridade} />
            <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full font-medium">
              {TIPO_LABEL[s.tipoManutencao]}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoField icon={<User className="w-3.5 h-3.5" />} label="Solicitante" value={s.criadaPor} />
            <InfoField icon={<Calendar className="w-3.5 h-3.5" />} label="Data" value={formatDate(s.criadaEm)} />
            <InfoField icon={<Layers className="w-3.5 h-3.5" />} label="Macro" value={s.macro} />
            <InfoField icon={<Tag className="w-3.5 h-3.5" />} label="TAG" value={s.tag} />
            <InfoField icon={<Settings className="w-3.5 h-3.5" />} label="Equipamento" value={s.equipamento} col2 />
          </div>

          {s.equipamentoDescricao && (
            <p className="text-xs text-gray-500">{s.equipamentoDescricao}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            {s.familia && <div><span className="text-gray-400">Família:</span> <span className="font-mono text-gray-700">{s.familia}</span></div>}
            {s.centroCusto && <div><span className="text-gray-400">CC:</span> <span className="text-gray-700">{s.centroCusto}</span></div>}
          </div>

          {/* Descrição */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</p>
            <p className="text-sm text-gray-800">{s.descricao}</p>
          </div>

          {/* Observações */}
          {s.observacoes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Observações</p>
              <p className="text-sm text-gray-700">{s.observacoes}</p>
            </div>
          )}

          {s.ordemInternaId && (
            <div className="flex items-center gap-2 bg-brand-50 rounded-xl p-3">
              <FileText className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-brand-700">Ordem Interna gerada</p>
                <p className="text-xs font-mono text-brand-600">{s.ordemInternaId}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          {s.aprovacoes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Histórico de Aprovação</p>
              <div className="space-y-3">
                {s.aprovacoes.map((apr, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl ${apr.status === 'aprovada' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {apr.status === 'aprovada'
                      ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{apr.aprovadorNome}</p>
                      <p className="text-xs text-gray-500">{formatDate(apr.dataAcao)}</p>
                      {apr.comentario && <p className="text-xs text-gray-700 mt-1 italic">"{apr.comentario}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.motivoRejeicao && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs font-semibold text-red-700 mb-1">Motivo da Rejeição</p>
              <p className="text-sm text-red-800">{s.motivoRejeicao}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          {s.status === 'pendente' && (
            <div className="flex gap-2">
              <button
                onClick={onAprovar}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" /> Aprovar
              </button>
              <button
                onClick={onRejeitar}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                <XCircle className="w-4 h-4" /> Rejeitar
              </button>
            </div>
          )}
          {s.status === 'aprovada' && (
            <button
              onClick={onConverter}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              <ArrowRightCircle className="w-4 h-4" /> Converter em Ordem Interna
            </button>
          )}
          {(s.status === 'rejeitada' || s.status === 'convertida') && (
            <p className="text-center text-xs text-gray-400">
              {s.status === 'convertida' ? 'Solicitação convertida em ordem interna.' : 'Solicitação rejeitada.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon, label, value, col2,
}: { icon: React.ReactNode; label: string; value: string; col2?: boolean }) {
  return (
    <div className={col2 ? 'col-span-2' : ''}>
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
        {icon} {label}
      </div>
      <p className="text-sm font-medium text-gray-800 font-mono truncate">{value || '—'}</p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type TabFilter = 'todas' | 'pendentes' | 'aprovadas' | 'rejeitadas' | 'convertidas';

export default function ManutencaoSolicitacoes() {
  const { solicitacoes, converterParaOrdem } = useSolicitacoes();
  const [tab, setTab] = useState<TabFilter>('todas');
  const [showNova, setShowNova] = useState(false);
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [actionModal, setActionModal] = useState<'aprovar' | 'rejeitar' | null>(null);

  const counts = useMemo(() => ({
    todas: solicitacoes.length,
    pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
    aprovadas: solicitacoes.filter(s => s.status === 'aprovada').length,
    rejeitadas: solicitacoes.filter(s => s.status === 'rejeitada').length,
    convertidas: solicitacoes.filter(s => s.status === 'convertida').length,
  }), [solicitacoes]);

  const filtered = useMemo(() => {
    if (tab === 'todas') return solicitacoes;
    const map: Record<TabFilter, string> = {
      todas: '',
      pendentes: 'pendente',
      aprovadas: 'aprovada',
      rejeitadas: 'rejeitada',
      convertidas: 'convertida',
    };
    return solicitacoes.filter(s => s.status === map[tab]);
  }, [solicitacoes, tab]);

  function handleConverter() {
    if (!selected) return;
    converterParaOrdem(selected.id);
    setSelected(null);
  }

  const TABS: { key: TabFilter; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'aprovadas', label: 'Aprovadas' },
    { key: 'rejeitadas', label: 'Rejeitadas' },
    { key: 'convertidas', label: 'Convertidas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Solicitações de Serviço</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie as solicitações de manutenção</p>
        </div>
        <button
          onClick={() => setShowNova(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors self-start"
        >
          <ClipboardPlus className="w-4 h-4" />
          Nova Solicitação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.todas} color="brand" />
        <StatCard label="Pendentes" value={counts.pendentes} color="yellow" />
        <StatCard label="Aprovadas" value={counts.aprovadas} color="green" />
        <StatCard label="Rejeitadas" value={counts.rejeitadas} color="red" />
      </div>

      {/* Table card */}
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
            <ClipboardPlus className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma solicitação encontrada</p>
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
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelected(s)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{s.id}</td>
                    <td className="px-4 py-3 text-gray-800 font-mono text-xs whitespace-nowrap">{s.equipamento}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{s.tag}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={s.descricao}>{s.descricao}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{TIPO_LABEL[s.tipoManutencao]}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={s.prioridade} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(s.criadaEm)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(s); }}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800"
                      >
                        Detalhe <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNova && <NovaSolicitacaoModal onClose={() => setShowNova(false)} />}

      {selected && !actionModal && (
        <DetailPanel
          solicitacao={selected}
          onClose={() => setSelected(null)}
          onAprovar={() => setActionModal('aprovar')}
          onRejeitar={() => setActionModal('rejeitar')}
          onConverter={handleConverter}
        />
      )}

      {selected && actionModal && (
        <ActionModal
          type={actionModal}
          solicitacaoId={selected.id}
          onClose={() => {
            setActionModal(null);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-xl border border-gray-100 shadow-sm p-4 ${colorMap[color] ?? 'bg-gray-50 text-gray-700'}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
