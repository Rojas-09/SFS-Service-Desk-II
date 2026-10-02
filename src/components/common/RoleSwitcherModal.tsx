import React from 'react';
import { useApp } from '../../context/AppContext';
import { RolUsuario } from '../../types';
import {
  UserCheck,
  Building2,
  Headphones,
  ShieldAlert,
  Settings,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    usuarios,
    empresas,
    cambiarUsuarioSimulado,
  } = useApp();

  if (!isOpen) return null;

  const handleSelectUser = (userId: string) => {
    cambiarUsuarioSimulado(userId);
    onClose();
  };

  const getRoleHeaderInfo = (rol: RolUsuario) => {
    switch (rol) {
      case 'cliente':
        return {
          title: 'Clientes Externos (Empresas Cafeteras)',
          desc: 'Visualizan únicamente los tickets de su empresa, radican nuevos casos, adjuntan archivos y califican el servicio.',
          badge: 'PORTAL CLIENTE',
          badgeColor: 'bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300',
          icon: Building2,
        };
      case 'agente':
        return {
          title: 'Agentes Especialistas (Soporte SFS)',
          desc: 'Atienden la cola general, toman tickets, redactan respuestas y notas internas confidenciales con macros.',
          badge: 'CONSOLA SFS',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          icon: Headphones,
        };
      case 'supervisor':
        return {
          title: 'Supervisores de Mesa de Ayuda (SFS)',
          desc: 'Gestión total de la cola, asignación manual/automática, métricas & SLA, comunicados masivos y empresas.',
          badge: 'SUPERVISIÓN',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          icon: ShieldAlert,
        };
      case 'admin':
        return {
          title: 'Administradores TI & Sistemas (SFS)',
          desc: 'Acceso total, configuración de reglas SLA en horario de Colombia, gestión de usuarios, roles y seguridad.',
          badge: 'ADMINISTRACIÓN',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          icon: Settings,
        };
    }
  };

  const rolesOrder: RolUsuario[] = ['cliente', 'agente', 'supervisor', 'admin'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#0E244D] border-t sm:border border-slate-200 dark:border-[#1A3668] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-250 z-10">
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1A3668] flex items-center justify-between bg-slate-50/80 dark:bg-[#081B3A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F37021]/10 text-[#F37021] dark:bg-[#F37021]/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <span>Cambiar Rol de Usuario</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1565C0] text-white">
                  <Sparkles className="w-3 h-3" />
                  Demostración
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prueba la experiencia de SFS Service Desk desde cualquier perfil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar selector de rol"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / User list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {rolesOrder.map((rol) => {
            const roleInfo = getRoleHeaderInfo(rol);
            const roleUsers = usuarios.filter((u) => u.rol === rol);
            const Icon = roleInfo.icon;

            return (
              <div key={rol} className="space-y-2">
                {/* Role section header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#1565C0] dark:text-[#3FA2E8]" />
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {roleInfo.title}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleInfo.badgeColor}`}>
                    {roleInfo.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  {roleInfo.desc}
                </p>

                {/* User Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {roleUsers.map((u) => {
                    const emp = u.empresaId
                      ? empresas.find((e) => e.id === u.empresaId)
                      : null;
                    const isSelected = currentUser?.id === u.id;

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 shadow-2xs group ${
                          isSelected
                            ? 'bg-blue-50/90 dark:bg-blue-950/80 border-[#1565C0] dark:border-[#3FA2E8] ring-2 ring-[#1565C0]/20'
                            : 'bg-white dark:bg-[#081B3A]/60 border-slate-200 dark:border-[#1A3668] hover:border-[#1565C0] dark:hover:border-[#3FA2E8] hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar Circle */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 shadow-xs ${
                              isSelected
                                ? 'bg-[#1565C0] text-white'
                                : 'bg-[#0B2A5B] text-white dark:bg-slate-700'
                            }`}
                          >
                            {u.nombre[0]}
                            {u.apellidos[0]}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                              {u.nombre} {u.apellidos}
                            </span>
                            <span className="text-[11px] text-[#1565C0] dark:text-[#3FA2E8] font-semibold truncate">
                              {emp ? emp.nombre : u.cargo}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>

                        {/* Status Check / Action */}
                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Activo</span>
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 group-hover:text-[#1565C0] dark:group-hover:text-[#3FA2E8] transition">
                              Cambiar →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-[#1A3668] bg-slate-50 dark:bg-[#081B3A] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Usuario activo:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {currentUser?.nombre} {currentUser?.apellidos}
            </strong>{' '}
            ({currentUser?.rol.toUpperCase()})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 transition text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
