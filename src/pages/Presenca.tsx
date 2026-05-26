import { useState } from 'react';
import { ClipboardCheck, ChevronDown, CheckCircle2, XCircle, Save } from 'lucide-react';
import { useCatequizandos, useTurmas, usePresencas } from '../store/useStore';
import type { RegistroPresenca } from '../types';

export default function Presenca() {
  const { items: catequizandos } = useCatequizandos();
  const { items: turmas } = useTurmas();
  const { items: presencas, add, update } = usePresencas();

  const [turmaSel, setTurmaSel] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [marcacoes, setMarcacoes] = useState<Record<string, boolean>>({});
  const [justificativas, setJustificativas] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const alunos = catequizandos.filter(c => c.turmaId === turmaSel);

  const existente = presencas.find(p => p.turmaId === turmaSel && p.data === data);

  const handleTurmaChange = (id: string) => {
    setTurmaSel(id);
    setSaved(false);
    const reg = presencas.find(p => p.turmaId === id && p.data === data);
    if (reg) {
      const m: Record<string, boolean> = {};
      const j: Record<string, string> = {};
      reg.presencas.forEach(pr => {
        m[pr.catequizandoId] = pr.presente;
        if (pr.justificativa) j[pr.catequizandoId] = pr.justificativa;
      });
      setMarcacoes(m);
      setJustificativas(j);
    } else {
      const init: Record<string, boolean> = {};
      catequizandos.filter(c => c.turmaId === id).forEach(c => { init[c.id] = false; });
      setMarcacoes(init);
      setJustificativas({});
    }
  };

  const handleDataChange = (d: string) => {
    setData(d);
    setSaved(false);
    if (!turmaSel) return;
    const reg = presencas.find(p => p.turmaId === turmaSel && p.data === d);
    if (reg) {
      const m: Record<string, boolean> = {};
      const j: Record<string, string> = {};
      reg.presencas.forEach(pr => {
        m[pr.catequizandoId] = pr.presente;
        if (pr.justificativa) j[pr.catequizandoId] = pr.justificativa;
      });
      setMarcacoes(m);
      setJustificativas(j);
    } else {
      const init: Record<string, boolean> = {};
      alunos.forEach(c => { init[c.id] = false; });
      setMarcacoes(init);
      setJustificativas({});
    }
  };

  const toggle = (id: string) => {
    setSaved(false);
    setMarcacoes(p => ({ ...p, [id]: !p[id] }));
  };

  const marcarTodos = (presente: boolean) => {
    setSaved(false);
    const m: Record<string, boolean> = {};
    alunos.forEach(c => { m[c.id] = presente; });
    setMarcacoes(m);
  };

  const handleSalvar = () => {
    if (!turmaSel) return;
    const registro: RegistroPresenca = {
      id: existente?.id || crypto.randomUUID(),
      turmaId: turmaSel,
      data,
      presencas: alunos.map(c => ({
        catequizandoId: c.id,
        presente: !!marcacoes[c.id],
        justificativa: justificativas[c.id] || undefined,
      })),
      createdAt: existente?.createdAt || new Date().toISOString(),
    };
    if (existente) update(registro); else add(registro);
    setSaved(true);
  };

  const presentes = alunos.filter(c => marcacoes[c.id]).length;
  const ausentes = alunos.length - presentes;

  // Histórico da turma selecionada
  const historico = presencas
    .filter(p => p.turmaId === turmaSel)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 10);

  const pct = (p: RegistroPresenca) => {
    const t = p.presencas.length;
    if (t === 0) return 0;
    return Math.round((p.presencas.filter(x => x.presente).length / t) * 100);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Registro de Presença</h1>
        <p className="text-gray-500 text-sm mt-0.5">Marque a presença dos catequizandos por turma e data</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
            <div className="relative">
              <select
                value={turmaSel}
                onChange={e => handleTurmaChange(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Selecione uma turma —</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={e => handleDataChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {turmaSel && alunos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum catequizando nesta turma.</p>
        )}

        {turmaSel && alunos.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-sm">
                <span className="text-emerald-600 font-medium">{presentes} presentes</span>
                <span className="text-gray-300">·</span>
                <span className="text-red-500 font-medium">{ausentes} ausentes</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => marcarTodos(true)} className="text-xs text-emerald-600 hover:underline">Marcar todos</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => marcarTodos(false)} className="text-xs text-red-500 hover:underline">Desmarcar todos</button>
              </div>
            </div>

            <div className="space-y-2">
              {alunos.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <button
                    onClick={() => toggle(c.id)}
                    className={`flex-shrink-0 transition-colors ${marcacoes[c.id] ? 'text-emerald-500' : 'text-gray-300'}`}
                  >
                    {marcacoes[c.id]
                      ? <CheckCircle2 className="w-6 h-6" />
                      : <XCircle className="w-6 h-6" />
                    }
                  </button>
                  <span className={`flex-1 text-sm font-medium ${marcacoes[c.id] ? 'text-gray-800' : 'text-gray-400'}`}>
                    {c.nome}
                  </span>
                  {!marcacoes[c.id] && (
                    <input
                      value={justificativas[c.id] || ''}
                      onChange={e => {
                        setSaved(false);
                        setJustificativas(p => ({ ...p, [c.id]: e.target.value }));
                      }}
                      placeholder="Justificativa (opcional)"
                      className="text-xs border border-gray-200 rounded px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSalvar}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Presença salva!</> : <><Save className="w-4 h-4" /> Salvar Presença</>}
            </button>
          </>
        )}
      </div>

      {turmaSel && historico.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Histórico de Presenças
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase tracking-wide border-b">
                <tr>
                  <th className="text-left pb-2">Data</th>
                  <th className="text-left pb-2">Presentes</th>
                  <th className="text-left pb-2">Ausentes</th>
                  <th className="text-left pb-2">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historico.map(r => {
                  const tot = r.presencas.length;
                  const pr = r.presencas.filter(x => x.presente).length;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-700">{new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td className="py-2 text-emerald-600 font-medium">{pr}</td>
                      <td className="py-2 text-red-500 font-medium">{tot - pr}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct(r)}%` }} />
                          </div>
                          <span className="text-gray-600 text-xs">{pct(r)}%</span>
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
    </div>
  );
}
