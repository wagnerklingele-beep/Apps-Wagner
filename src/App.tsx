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
import { ManutencaoProvider } from './context/ManutencaoContext';

export default function App() {
  return (
    <BrowserRouter>
      <ManutencaoProvider>
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
          </Route>
        </Routes>
      </ManutencaoProvider>
    </BrowserRouter>
  );
}
