import React from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  Inbox,
  UserCheck,
  HelpCircle,
  Layers,
  BarChart3,
  Megaphone,
  Building2,
  Users,
  Settings,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Bell,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentPath, navigate, currentUser, tickets, notificaciones, abrirNotificaciones } = useApp();

  const unreadNotifsCount = currentUser
    ? notificaciones.filter((n) => n.usuarioId === currentUser.id && !n.leida).length
    : 0;

  // Counts
  const misTicketsCount = tickets.filter(
    (t) => t.asignadoAId === currentUser?.id && t.estado !== 'cerrado' && t.estado !== 'resuelto'
  ).length;

  const sinAsignarCount = tickets.filter(
    (t) => !t.asignadoAId && t.estado !== 'cerrado' && t.estado !== 'resuelto'
  ).length;

  const activosCount = tickets.filter(
    (t) => t.estado !== 'cerrado' && t.estado !== 'resuelto'
  ).length;

  const esSupervisorOAdmin = currentUser?.rol === 'supervisor' || currentUser?.rol === 'admin';

  const menuItems = [
    {
      id: 'bandeja',
      label: 'Bandeja Principal',
      path: '/consola/bandeja',
      icon: Inbox,
      badge: activosCount,
      badgeColor: 'bg-[#1565C0] text-white',
    },
    {
      id: 'mis-tickets',
      label: 'Mis Tickets',
      path: '/consola/bandeja?filtro=mis_tickets',
      icon: UserCheck,
      badge: misTicketsCount,
      badgeColor: 'bg-[#F37021] text-white',
    },
    {
      id: 'sin-asignar',
      label: 'Sin Asignar',
      path: '/consola/bandeja?filtro=sin_asignar',
      icon: HelpCircle,
      badge: sinAsignarCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'todos',
      label: 'Todos los Tickets',
      path: '/consola/bandeja?filtro=todos',
      icon: Layers,
      badge: tickets.length,
      badgeColor: 'bg-slate-700 text-slate-200',
    },
  ];

  const adminItems = [
    {
      id: 'metricas',
      label: 'Métricas & SLA',
      path: '/consola/metricas',
      icon: BarChart3,
      reqAdmin: false, // Agents can also view performance
    },
    {
      id: 'anuncios',
      label: 'Anuncios Masivos',
      path: '/consola/anuncios',
      icon: Megaphone,
      reqAdmin: true,
    },
    {
      id: 'empresas',
      label: 'Empresas Cliente',
      path: '/consola/empresas',
      icon: Building2,
      reqAdmin: true,
    },
    {
      id: 'usuarios',
      label: 'Usuarios & Accesos',
      path: '/consola/usuarios',
      icon: Users,
      reqAdmin: true,
    },
    {
      id: 'configuracion',
      label: 'Configuración SLA',
      path: '/consola/configuracion',
      icon: Settings,
      reqAdmin: true,
    },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0B2A5B] text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 border-r border-[#153B75] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo */}
        <div>
          <div className="p-4 border-b border-[#153B75]/70 flex items-center justify-between">
            <Logo size="md" variant="light" />
          </div>

          {/* Navigation */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Tickets section */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Atención & Cola
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path || (item.path.includes('?') && currentPath.includes(item.path.split('?')[1]));
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#1565C0] text-white font-semibold shadow-md'
                          : 'text-slate-200 hover:bg-[#12366E] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#3FA2E8]' : 'text-slate-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Notificaciones in Sidebar */}
                <button
                  onClick={() => {
                    abrirNotificaciones();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-[#12366E] hover:text-white transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#F37021]" />
                    <span>Notificaciones</span>
                  </div>
                  {unreadNotifsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F37021] text-white">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Management Section */}
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Gestión & Analítica
              </div>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  if (item.reqAdmin && !esSupervisorOAdmin) return null;
                  const Icon = item.icon;
                  const isActive = currentPath.startsWith(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#1565C0] text-white font-semibold shadow-md'
                          : 'text-slate-200 hover:bg-[#12366E] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#3FA2E8]' : 'text-slate-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Switch to Client Portal shortcut */}
            <div className="pt-2">
              <button
                onClick={() => handleNav('/portal')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-200 hover:text-white bg-[#081B3A]/60 hover:bg-[#12366E] rounded-xl border border-[#1A4585] transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#F37021]" />
                <span>Ver Portal del Cliente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Team active badge */}
        <div className="p-3 border-t border-[#153B75]/70 bg-[#081B3A]/40 m-2 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#3FA2E8]" />
                <span>Horario Colombia Activo</span>
              </div>
              <div className="text-[10px] text-slate-300">
                SLA 8:00 AM - 6:00 PM (GMT-5)
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
