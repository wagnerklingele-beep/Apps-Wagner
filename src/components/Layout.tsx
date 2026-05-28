import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, ClipboardCheck,
  Wallet, Menu, X, Church, Wrench, ClipboardList, GitBranch,
} from 'lucide-react';

const catechesisNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/turmas', label: 'Turmas', icon: BookOpen },
  { to: '/catequizandos', label: 'Catequizandos', icon: Users },
  { to: '/catequistas', label: 'Catequistas', icon: UserCheck },
  { to: '/presenca', label: 'Presença', icon: ClipboardCheck },
  { to: '/caixa', label: 'Fluxo de Caixa', icon: Wallet },
];

const manutencaoNav = [
  { to: '/manutencao', label: 'Painel', icon: Wrench, exact: true },
  { to: '/manutencao/ordens', label: 'Ordens', icon: ClipboardList },
  { to: '/manutencao/ativos', label: 'Árvore de Ativos', icon: GitBranch },
];

function NavSection({
  title, items, onClose,
}: {
  title: string;
  items: typeof catechesisNav;
  onClose?: () => void;
}) {
  return (
    <div className="mb-2">
      <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400/70">
        {title}
      </p>
      {items.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${isActive
              ? 'bg-blue-700 text-white'
              : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
          }
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  const sidebarContent = (onClose?: () => void) => (
    <>
      <NavSection title="Catequese" items={catechesisNav} onClose={onClose} />
      <div className="mx-4 my-2 border-t border-blue-800/60" />
      <NavSection title="Manutenção" items={manutencaoNav} onClose={onClose} />
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-800">
          <Church className="w-7 h-7 text-blue-300" />
          <div>
            <p className="font-bold text-sm leading-tight">Apps</p>
            <p className="font-bold text-base leading-tight text-blue-200">Wagner</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {sidebarContent()}
        </nav>
        <div className="px-6 py-4 border-t border-blue-800 text-xs text-blue-400">
          v1.0 · {new Date().getFullYear()}
        </div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-blue-900 text-white">
            <div className="flex items-center justify-between px-6 py-5 border-b border-blue-800">
              <div className="flex items-center gap-3">
                <Church className="w-7 h-7 text-blue-300" />
                <span className="font-bold text-blue-200">Apps Wagner</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-blue-300" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {sidebarContent(() => setOpen(false))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b shadow-sm">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Church className="w-5 h-5 text-blue-700" />
            <span className="font-bold text-gray-800">Apps Wagner</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
