import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, ClipboardCheck, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useCatequizandos, useCatequistas, useTurmas, usePresencas, useLancamentos } from '../store/useStore';

function StatCard({
  title, value, icon: Icon, color, barColor, to
}: {
  title: string; value: number | string; icon: React.ElementType;
  color: string; barColor: string; to: string;
}) {
  return (
    <Link to={to} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col">
      <div className={`h-1.5 w-full ${barColor}`} />
      <div className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{title}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { items: catequizandos } = useCatequizandos();
  const { items: catequistas } = useCatequistas();
  const { items: turmas } = useTurmas();
  const { items: presencas } = usePresencas();
  const { items: lancamentos } = useLancamentos();

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'receita')
    .reduce((s, l) => s + l.valor, 0);
  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'despesa')
    .reduce((s, l) => s + l.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const hoje = new Date().toISOString().split('T')[0];
  const presencasHoje = presencas.filter(p => p.data === hoje);

  const mesAtual = new Date().toISOString().slice(0, 7);
  const lancamentosMes = lancamentos.filter(l => l.data.startsWith(mesAtual));
  const receitasMes = lancamentosMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const despesasMes = lancamentosMes.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);

  const ultimosLancamentos = [...lancamentos]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral da catequese</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Catequizandos" value={catequizandos.length} icon={Users} color="bg-blue-500" barColor="bg-blue-400" to="/catequizandos" />
        <StatCard title="Catequistas" value={catequistas.length} icon={UserCheck} color="bg-purple-500" barColor="bg-purple-400" to="/catequistas" />
        <StatCard title="Turmas" value={turmas.length} icon={BookOpen} color="bg-green-500" barColor="bg-green-400" to="/turmas" />
        <StatCard title="Presenças Hoje" value={presencasHoje.length} icon={ClipboardCheck} color="bg-orange-500" barColor="bg-orange-400" to="/presenca" />
        <StatCard title="Saldo" value={fmt(saldo)} icon={Wallet} color={saldo >= 0 ? 'bg-emerald-500' : 'bg-red-500'} barColor={saldo >= 0 ? 'bg-emerald-400' : 'bg-red-400'} to="/caixa" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Resumo financeiro do mês */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Financeiro — Mês Atual</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Receitas</span>
              </div>
              <span className="font-bold text-emerald-600">{fmt(receitasMes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Despesas</span>
              </div>
              <span className="font-bold text-red-500">{fmt(despesasMes)}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Saldo do mês</span>
              <span className={`font-bold text-lg ${receitasMes - despesasMes >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {fmt(receitasMes - despesasMes)}
              </span>
            </div>
          </div>
        </div>

        {/* Últimos lançamentos */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Últimos Lançamentos</h2>
          {ultimosLancamentos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum lançamento ainda.</p>
          ) : (
            <div className="space-y-2">
              {ultimosLancamentos.map(l => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-700">{l.descricao}</p>
                    <p className="text-xs text-gray-400">{new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')} · {l.categoria}</p>
                  </div>
                  <span className={`font-semibold ${l.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Turmas */}
      {turmas.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Turmas Cadastradas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {turmas.map(t => {
              const total = catequizandos.filter(c => c.turmaId === t.id).length;
              return (
                <div key={t.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-800">{t.nome}</p>
                  <p className="text-xs text-gray-500">{t.nivel}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.horario} · {total} aluno(s)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
