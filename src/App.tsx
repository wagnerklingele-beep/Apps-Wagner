import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Turmas from './pages/Turmas';
import Catequizandos from './pages/Catequizandos';
import Catequistas from './pages/Catequistas';
import Presenca from './pages/Presenca';
import FluxoCaixa from './pages/FluxoCaixa';
import ManutencaoDashboard from './pages/manutencao/ManutencaoDashboard';
import ManutencaoOrdens from './pages/manutencao/ManutencaoOrdens';
import ManutencaoAtivos from './pages/manutencao/ManutencaoAtivos';
import ManutencaoSolicitacoes from './pages/manutencao/ManutencaoSolicitacoes';
import ManutencaoAprovadores from './pages/manutencao/ManutencaoAprovadores';
import ManutencaoOrdensInternas from './pages/manutencao/ManutencaoOrdensInternas';
import ManutencaoPlanejamento from './pages/manutencao/ManutencaoPlanejamento';
import { ManutencaoProvider } from './context/ManutencaoContext';
import SolicitacoesProvider from './context/SolicitacoesContext';

export default function App() {
  return (
    <BrowserRouter>
      <ManutencaoProvider>
        <SolicitacoesProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="turmas" element={<Turmas />} />
              <Route path="catequizandos" element={<Catequizandos />} />
              <Route path="catequistas" element={<Catequistas />} />
              <Route path="presenca" element={<Presenca />} />
              <Route path="caixa" element={<FluxoCaixa />} />
              <Route path="manutencao" element={<ManutencaoDashboard />} />
              <Route path="manutencao/ordens" element={<ManutencaoOrdens />} />
              <Route path="manutencao/ativos" element={<ManutencaoAtivos />} />
              <Route path="manutencao/solicitacoes" element={<ManutencaoSolicitacoes />} />
              <Route path="manutencao/aprovadores" element={<ManutencaoAprovadores />} />
              <Route path="manutencao/ordens-internas" element={<ManutencaoOrdensInternas />} />
              <Route path="manutencao/planejamento/:id" element={<ManutencaoPlanejamento />} />
            </Route>
          </Routes>
        </SolicitacoesProvider>
      </ManutencaoProvider>
    </BrowserRouter>
  );
}
