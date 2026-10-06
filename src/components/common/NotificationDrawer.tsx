import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  UserCheck,
  Megaphone,
  Check,
  Trash2,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { tiempoRelativoCO } from '../../lib/utils';

export const NotificationDrawer: React.FC = () => {
  const {
    notificacionesAbiertas,
    cerrarNotificaciones,
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    eliminarNotificacion,
    limpiarNotificacionesLeidas,
    currentUser,
    navigate,
    showToast,
  } = useApp();

  const [filtro, setFiltro] = useState<'todas' | 'no_leidas' | 'sla' | 'tickets'>('todas');

  if (!notificacionesAbiertas) return null;

  // Filter notifications for this user
  const misNotifs = currentUser
    ? notificaciones.filter((n) => n.usuarioId === currentUser.id)
    : [];

  const noLeidasCount = misNotifs.filter((n) => !n.leida).length;
  const slaAlertsCount = misNotifs.filter((n) => n.tipo === 'sla_vencer').length;

  const notifsFiltradas = misNotifs.filter((n) => {
    if (filtro === 'no_leidas') return !n.leida;
    if (filtro === 'sla') return n.tipo === 'sla_vencer';
    if (filtro === 'tickets')
      return ['ticket_nuevo', 'ticket_asignado', 'nueva_respuesta', 'ticket_resuelto'].includes(
        n.tipo
      );
    return true;
  });

  const handleOpenTicket = (nId: string, ticketId?: string) => {
    marcarNotificacionLeida(nId);
    if (ticketId) {
      if (currentUser?.rol === 'cliente') {
        navigate(`/portal/ticket/${ticketId}`);
      } else {
        navigate(`/consola/ticket/${ticketId}`);
      }
    }
    cerrarNotificaciones();
  };

  const getNotificationBadgeInfo = (tipo: string) => {
    switch (tipo) {
      case 'ticket_nuevo':
        return {
          label: 'NUEVO TICKET',
          badgeClass: 'bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300',
          icon: MessageSquare,
        };
      case 'ticket_asignado':
        return {
          label: 'CASO ASIGNADO',
          badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          icon: UserCheck,
        };
      case 'nueva_respuesta':
        return {
          label: 'RESPUESTA SFS',
          badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
          icon: MessageSquare,
        };
      case 'sla_vencer':
        return {
          label: 'ALERTA SLA CRÍTICO',
          badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse',
          icon: Flame,
        };
      case 'ticket_resuelto':
        return {
          label: 'TICKET RESUELTO',
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          icon: CheckCircle2,
        };
      case 'anuncio':
        return {
          label: 'COMUNICADO SFS',
          badgeClass: 'bg-orange-100 text-[#F37021] dark:bg-orange-950 dark:text-orange-300',
          icon: Megaphone,
        };
      default:
        return {
          label: 'NOTIFICACIÓN',
          badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          icon: Bell,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={cerrarNotificaciones}
      />

      {/* Slide-over Drawer (strictly on the RIGHT for both mobile and desktop) */}
      <div className="relative w-full sm:w-[480px] h-full bg-white dark:bg-[#0B1E3B] shadow-2xl border-l border-slate-200 dark:border-[#1B2F52] flex flex-col animate-in slide-in-from-right duration-250 z-10">
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1B2F52] flex items-center justify-between bg-slate-50/90 dark:bg-[#081528] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1565C0]/10 dark:bg-[#1565C0]/25 text-[#1565C0] dark:text-[#3FA2E8] flex items-center justify-center shadow-xs shrink-0">
              <Bell className="w-5 h-5 text-[#1565C0] dark:text-[#3FA2E8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#0B2A5B] dark:text-white">
                  Centro de Notificaciones & SLA
                </h3>
                {noLeidasCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F37021] text-white shadow-2xs font-mono">
                    {noLeidasCount} NUEVA{noLeidasCount > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Alertas operativas, respuestas técnicas y tiempos de resolución
              </p>
            </div>
          </div>

          <button
            onClick={cerrarNotificaciones}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar panel de notificaciones"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Segmented Control & Actions */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#1B2F52] flex items-center justify-between bg-white dark:bg-[#0B1E3B] shrink-0 gap-2 overflow-x-auto">
          {/* Segmented Filter (Anti-slop clean design) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#081528] rounded-xl text-xs shrink-0">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                filtro === 'todas'
                  ? 'bg-white dark:bg-[#1565C0] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({misNotifs.length})
            </button>
            <button
              onClick={() => setFiltro('no_leidas')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                filtro === 'no_leidas'
                  ? 'bg-[#F37021] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#F37021]'
              }`}
            >
              No leídas ({noLeidasCount})
            </button>
            {slaAlertsCount > 0 && (
              <button
                onClick={() => setFiltro('sla')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                  filtro === 'sla'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>SLA ({slaAlertsCount})</span>
              </button>
            )}
            <button
              onClick={() => setFiltro('tickets')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                filtro === 'tickets'
                  ? 'bg-white dark:bg-[#1565C0] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tickets
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {noLeidasCount > 0 && (
              <button
                onClick={() => {
                  marcarTodasNotificacionesLeidas();
                  showToast('Todas las notificaciones marcadas como leídas', 'exito');
                }}
                className="text-[11px] font-bold text-[#1565C0] dark:text-[#3FA2E8] hover:underline flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marcar leídas</span>
              </button>
            )}
            {misNotifs.some((n) => n.leida) && (
              <button
                onClick={() => {
                  limpiarNotificacionesLeidas();
                  showToast('Notificaciones leídas eliminadas', 'info');
                }}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1"
                title="Eliminar notificaciones ya leídas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifsFiltradas.length === 0 ? (
            <div className="py-20 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                ¡Bandeja al día!
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                {filtro === 'no_leidas'
                  ? 'No tienes alertas ni mensajes pendientes por revisar en este momento.'
                  : filtro === 'sla'
                  ? 'Todos los tickets están dentro del tiempo acordado de SLA.'
                  : 'No se encontraron notificaciones en esta categoría.'}
              </p>
            </div>
          ) : (
            notifsFiltradas.map((notif) => {
              const badgeInfo = getNotificationBadgeInfo(notif.tipo);
              const BadgeIcon = badgeInfo.icon;
              const isSlaWarning = notif.tipo === 'sla_vencer';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 relative shadow-xs ${
                    notif.leida
                      ? 'border-slate-200/70 dark:border-[#1A3668]/60 bg-white dark:bg-[#081B3A]/40 opacity-80'
                      : isSlaWarning
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 ring-1 ring-rose-200 dark:ring-rose-900/60'
                      : 'border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40'
                  }`}
                >
                  {/* Top Bar: Badge, Time & Dismiss */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeInfo.badgeClass}`}
                      >
                        <BadgeIcon className="w-3 h-3 shrink-0" />
                        <span>{badgeInfo.label}</span>
                      </span>

                      {!notif.leida && (
                        <span className="w-2 h-2 rounded-full bg-[#F37021] shrink-0 animate-ping" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {tiempoRelativoCO(notif.creadaEn)}
                      </span>

                      <button
                        type="button"
                        onClick={() => eliminarNotificacion(notif.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Eliminar notificación"
                        aria-label="Eliminar notificación"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      {notif.titulo}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.mensaje}
                    </p>
                  </div>

                  {/* Primary Action Button */}
                  {notif.ticketId && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenTicket(notif.id, notif.ticketId)}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition active:scale-98 ${
                          isSlaWarning
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-[#1565C0] hover:bg-[#1976D2]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-mono">
                          <span>Ver caso #{notif.ticketId.replace('tkt-', 'SFS-')}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold opacity-90">Ir al caso</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1B2F52] bg-slate-50/90 dark:bg-[#081528] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium font-mono">
              COT (GMT-5) • Soporte en Línea
            </span>
          </div>
          <button
            onClick={cerrarNotificaciones}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
