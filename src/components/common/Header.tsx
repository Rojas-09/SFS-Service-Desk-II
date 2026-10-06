import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import { RoleSwitcherModal } from './RoleSwitcherModal';
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  UserCheck,
  Building2,
  ExternalLink,
  Menu,
} from 'lucide-react';

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
    empresas,
    notificaciones,
    abrirNotificaciones,
    darkMode,
    toggleDarkMode,
    cerrarSesion,
    navigate,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications count for this user
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

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0D1E38] border-b border-slate-200/80 dark:border-[#1B2F52] px-3 sm:px-6 flex items-center justify-between shadow-2xs transition-colors">
        {/* Left Section: Mobile hamburger & Logo / Brand & Editorial Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {showSidebarToggle && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo: Always visible for ALL users on mobile and desktop */}
          <div
            onClick={() => navigate(currentUser?.rol === 'cliente' ? '/portal' : '/consola/bandeja')}
            className="cursor-pointer hover:opacity-95 transition shrink-0 flex items-center py-1"
            title="Ir a inicio de SFS Service Desk"
          >
            <Logo size="md" variant="auto" />
          </div>

          {/* Search bar (Desktop & Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative w-60 xl:w-72 ml-2"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar #ticket o palabra... (presiona /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-12 py-1.5 text-xs bg-slate-100/80 dark:bg-[#081528] border border-transparent dark:border-[#1B2F52] rounded-xl focus:outline-none focus:border-[#1565C0] dark:focus:border-[#3FA2E8] text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 font-sans"
            />
            <span className="absolute right-2.5 text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded pointer-events-none">
              /
            </span>
          </form>
        </div>

        {/* Right Section: SLA Indicator, Notifications, Dark Mode, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Colombian SLA Business Hours Status Indicator (Quiet, non-pill) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">COT (GMT-5)</span>
            <span className="text-slate-400 dark:text-slate-400">· 8:00–18:00</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={abrirNotificaciones}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            aria-label="Abrir centro de notificaciones"
            title="Centro de Notificaciones y Alertas"
          >
            <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#F37021] text-white text-[10px] font-mono font-bold tabular-nums rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Fluid Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-90 transition-all duration-200 group"
            aria-label="Alternar modo claro u oscuro"
            title={darkMode ? 'Cambiar a modo claro corporativo' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 transform transition-transform duration-300 rotate-0 group-hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 transform transition-transform duration-300 rotate-0 group-hover:-rotate-12" />
            )}
          </button>

          {/* User profile dropdown button */}
          <div className="relative ml-0.5" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              aria-label="Menú de usuario"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0B2545] dark:bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 tracking-wider">
                {currentUser?.nombre?.[0] || 'U'}
                {currentUser?.apellidos?.[0] || ''}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser?.nombre} {currentUser?.apellidos}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 truncate max-w-[140px]">
                  {currentEmpresa ? currentEmpresa.nombre : currentUser?.cargo}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0D1E38] border border-slate-200 dark:border-[#1B2F52] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-100 dark:border-[#1B2F52] mb-1.5">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {currentUser?.nombre} {currentUser?.apellidos}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                    {currentUser?.email}
                  </div>
                  {currentEmpresa && (
                    <div className="flex items-center gap-1.5 text-xs text-[#1565C0] dark:text-[#3FA2E8] font-semibold mt-2">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{currentEmpresa.nombre}</span>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      Rol: {currentUser?.rol}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Activo</span>
                  </div>
                </div>

                {/* Highlighted Role Switcher inside Profile Menu */}
                <div className="p-1 bg-slate-50 dark:bg-[#081528] rounded-xl my-1.5 border border-slate-200 dark:border-[#1B2F52]">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowRoleModal(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-[#1565C0] dark:text-[#3FA2E8] hover:bg-white dark:hover:bg-slate-800 rounded-lg transition shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#F37021] shrink-0" />
                      <span className="text-slate-900 dark:text-white font-bold">Cambiar Rol de Usuario</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#F37021] text-white">
                      DEMO
                    </span>
                  </button>
                </div>

                {currentUser?.rol !== 'cliente' ? (
                  <button
                    onClick={() => {
                      navigate('/portal');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    <ExternalLink className="w-4 h-4 text-[#F37021]" />
                    <span>Ver Portal del Cliente</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/consola/bandeja');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    <ExternalLink className="w-4 h-4 text-[#1565C0]" />
                    <span>Ir a Consola Mesa de Ayuda</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    abrirNotificaciones();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Bell className="w-4 h-4 text-[#1565C0] dark:text-[#3FA2E8]" />
                  <span>Centro de Notificaciones</span>
                </button>

                <button
                  onClick={cerrarSesion}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition mt-1 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Role Switcher Modal / Bottom Sheet */}
      <RoleSwitcherModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </>
  );
};
