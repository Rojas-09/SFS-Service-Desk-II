import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  UserCheck,
  Building2,
  CheckCircle,
  ExternalLink,
  Menu,
  Clock,
} from 'lucide-react';
import { tiempoRelativoCO } from '../../lib/utils';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  showSidebarToggle = false,
}) => {
  const {
    currentUser,
    usuarios,
    empresas,
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    darkMode,
    toggleDarkMode,
    cambiarUsuarioSimulado,
    cerrarSesion,
    navigate,
    currentPath,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) {
        setShowSwitchMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications for this user
  const userNotifs = currentUser
    ? notificaciones.filter((n) => n.usuarioId === currentUser.id)
    : [];
  const unreadCount = userNotifs.filter((n) => !n.leida).length;

  const currentEmpresa = currentUser?.empresaId
    ? empresas.find((e) => e.id === currentUser.empresaId)
    : null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().replace('#', '').toUpperCase();
    if (currentUser?.rol === 'cliente') {
      navigate(`/portal?q=${encodeURIComponent(clean)}`);
    } else {
      navigate(`/consola/bandeja?q=${encodeURIComponent(clean)}`);
    }
  };

  const getRoleBadge = (rol?: string) => {
    switch (rol) {
      case 'cliente':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300">
            Cliente SFS
          </span>
        );
      case 'agente':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Agente Especialista
          </span>
        );
      case 'supervisor':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            Supervisor SFS
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Administrador TI
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0E244D] border-b border-[#E3E8F0] dark:border-[#1A3668] px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger or brand on portal */}
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Portal brand display if no sidebar is open */}
        {currentUser?.rol === 'cliente' && (
          <div
            onClick={() => navigate('/portal')}
            className="cursor-pointer hover:opacity-90 transition"
          >
            <Logo size="md" />
          </div>
        )}

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex items-center relative w-64 md:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por #ticket o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-[#081B3A] border border-transparent dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] dark:focus:border-[#3FA2E8] text-slate-800 dark:text-slate-100 transition"
          />
        </form>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Role Switcher Button */}
        <div className="relative" ref={switchRef}>
          <button
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F5F7FB] dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-slate-700 dark:text-slate-200 hover:border-[#1565C0] transition"
            title="Cambiar rápidamente de usuario para probar la experiencia según rol"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#F37021]" />
            <span className="hidden sm:inline">Probar Rol:</span>
            <span className="text-[#1565C0] dark:text-[#3FA2E8] font-bold">
              {currentUser?.rol === 'cliente'
                ? 'Cliente'
                : currentUser?.rol === 'agente'
                ? 'Agente'
                : 'Supervisor'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSwitchMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                Cambio rápido de perfil (Demo)
              </div>
              <div className="space-y-1">
                {usuarios.slice(0, 6).map((u) => {
                  const emp = u.empresaId
                    ? empresas.find((e) => e.id === u.empresaId)
                    : null;
                  const isSelected = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        cambiarUsuarioSimulado(u.id);
                        setShowSwitchMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {u.nombre} {u.apellidos}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {emp ? `${emp.nombre.split(' ')[0]} ${emp.nombre.split(' ')[1] || ''}` : u.cargo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getRoleBadge(u.rol)}
                        {isSelected && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#1565C0] dark:text-[#3FA2E8]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Alternar modo oscuro"
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Ver notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#F37021] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-3 border-b border-slate-100 dark:border-[#1A3668] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#0B2A5B] dark:text-white">
                    Notificaciones
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-[#F37021] font-bold">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={marcarTodasNotificacionesLeidas}
                    className="text-xs text-[#1565C0] dark:text-[#3FA2E8] hover:underline"
                  >
                    Marcar todas leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1A3668]">
                {userNotifs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    No tienes notificaciones pendientes.
                  </div>
                ) : (
                  userNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        marcarNotificacionLeida(n.id);
                        if (n.ticketId) {
                          if (currentUser?.rol === 'cliente') {
                            navigate(`/portal/ticket/${n.ticketId}`);
                          } else {
                            navigate(`/consola/ticket/${n.ticketId}`);
                          }
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-xs transition cursor-pointer flex items-start gap-2.5 ${
                        n.leida
                          ? 'bg-transparent opacity-75 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          : 'bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/60 font-medium'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#F37021]" />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {n.titulo}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                          {n.mensaje}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{tiempoRelativoCO(n.creadaEn)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B2A5B] dark:bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser?.nombre?.[0] || 'U'}
              {currentUser?.apellidos?.[0] || ''}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">
                {currentUser?.nombre} {currentUser?.apellidos}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {currentEmpresa ? currentEmpresa.nombre.slice(0, 24) + '...' : currentUser?.cargo}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="p-2 border-b border-slate-100 dark:border-[#1A3668] mb-1">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {currentUser?.nombre} {currentUser?.apellidos}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser?.email}
                </div>
                {currentEmpresa && (
                  <div className="flex items-center gap-1 text-xs text-[#1565C0] dark:text-[#3FA2E8] font-medium mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{currentEmpresa.nombre}</span>
                  </div>
                )}
                <div className="mt-2">{getRoleBadge(currentUser?.rol)}</div>
              </div>

              {currentUser?.rol !== 'cliente' && (
                <button
                  onClick={() => {
                    navigate('/portal');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Portal del Cliente</span>
                </button>
              )}

              {currentUser?.rol === 'cliente' && (
                <div className="px-3 py-1.5 text-[11px] text-slate-400">
                  Plan de Soporte: <strong>{currentEmpresa?.planSoporte || 'Gold'}</strong>
                </div>
              )}

              <button
                onClick={cerrarSesion}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition mt-1 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
