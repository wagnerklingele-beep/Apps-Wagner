import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, ClipboardCheck,
  Wallet, Menu, X, Church
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/turmas', label: 'Turmas', icon: BookOpen },
  { to: '/catequizandos', label: 'Catequizandos', icon: Users },
  { to: '/catequistas', label: 'Catequistas', icon: UserCheck },
  { to: '/presenca', label: 'Presença', icon: ClipboardCheck },
  { to: '/caixa', label: 'Fluxo de Caixa', icon: Wallet },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Church className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800 leading-tight">Gestão de</p>
            <p className="font-bold text-base text-blue-600 leading-tight">Catequese</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          v1.0 · {new Date().getFullYear()}
        </div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Church className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-blue-600">Catequese</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {nav.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button onClick={() => setOpen(true)} className="p-1 rounded-lg hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Church className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">Gestão de Catequese</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
