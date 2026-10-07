import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  MessageSquare,
  UserCheck,
  Megaphone,
  Check,
  Trash2,
  Flame,
  ArrowRight,
  Mail,
  Eye,
  Send,
  Search,
  ExternalLink,
} from 'lucide-react';
import { tiempoRelativoCO } from '../../lib/utils';
import { EmailSimulado } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    notificacionesAbiertas,
    cerrarNotificaciones,
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    eliminarNotificacion,
    limpiarNotificacionesLeidas,
    correosSimulados,
    limpiarCorreosSimulados,
    currentUser,
    navigate,
    showToast,
  } = useApp();

  const [vistaPrincipal, setVistaPrincipal] = useState<'notifs' | 'correos'>('notifs');
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas' | 'sla' | 'tickets'>('todas');
  const [busquedaCorreos, setBusquedaCorreos] = useState('');
  const [correoSeleccionado, setCorreoSeleccionado] = useState<EmailSimulado | null>(null);

  if (!notificacionesAbiertas) return null;

  // Filtrar notificaciones para este usuario
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

  // Filtrar correos simulados
  const correosFiltrados = correosSimulados.filter((c) => {
    if (!busquedaCorreos.trim()) return true;
    const q = busquedaCorreos.toLowerCase();
    return (
      c.subject.toLowerCase().includes(q) ||
      c.to.toLowerCase().includes(q) ||
      c.toName.toLowerCase().includes(q) ||
      (c.ticketNumero && c.ticketNumero.toLowerCase().includes(q))
    );
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

  const handleOpenTicketFromMail = (ticketId?: string) => {
    if (ticketId) {
      if (currentUser?.rol === 'cliente') {
        navigate(`/portal/ticket/${ticketId}`);
      } else {
        navigate(`/consola/ticket/${ticketId}`);
      }
      setCorreoSeleccionado(null);
      cerrarNotificaciones();
    }
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
      case 'ticket_reabierto':
        return {
          label: 'TICKET REABIERTO',
          badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          icon: Clock,
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

  const getEmailBadgeInfo = (evento: string) => {
    switch (evento) {
      case 'ticket_nuevo':
        return { label: 'RADICACIÓN TICKET', color: 'bg-blue-100 text-[#1565C0] dark:bg-blue-950/80 dark:text-blue-300' };
      case 'ticket_asignado':
        return { label: 'ASIGNACIÓN', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' };
      case 'nueva_respuesta':
        return { label: 'RESPUESTA', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300' };
      case 'ticket_resuelto':
        return { label: 'SOLUCIÓN & CSAT', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' };
      case 'ticket_reabierto':
        return { label: 'REAPERTURA', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' };
      case 'anuncio':
        return { label: 'COMUNICADO OFICIAL', color: 'bg-orange-100 text-[#F37021] dark:bg-orange-950/80 dark:text-orange-300' };
      default:
        return { label: 'EMAIL SFS', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' };
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={cerrarNotificaciones}
        />

        {/* Slide-over Drawer */}
        <div className="relative w-full sm:w-[500px] h-full bg-white dark:bg-[#0B1E3B] shadow-2xl border-l border-slate-200 dark:border-[#1B2F52] flex flex-col animate-in slide-in-from-right duration-250 z-10">
          
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1B2F52] flex items-center justify-between bg-slate-50/90 dark:bg-[#081528] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1565C0]/10 dark:bg-[#1565C0]/25 text-[#1565C0] dark:text-[#3FA2E8] flex items-center justify-center shadow-xs shrink-0">
                {vistaPrincipal === 'notifs' ? (
                  <Bell className="w-5 h-5 text-[#1565C0] dark:text-[#3FA2E8]" />
                ) : (
                  <Mail className="w-5 h-5 text-[#1565C0] dark:text-[#3FA2E8]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#0B2A5B] dark:text-white">
                    {vistaPrincipal === 'notifs' ? 'Centro de Notificaciones' : 'Bandeja de Correo Simulada'}
                  </h3>
                  {vistaPrincipal === 'notifs' && noLeidasCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F37021] text-white shadow-2xs font-mono">
                      {noLeidasCount} NUEVA{noLeidasCount > 1 ? 'S' : ''}
                    </span>
                  )}
                  {vistaPrincipal === 'correos' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-2xs font-mono">
                      {correosSimulados.length} DESPACHADOS
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {vistaPrincipal === 'notifs'
                    ? 'Alertas operativas, respuestas técnicas y eventos de SLA'
                    : 'Servicio simulado de salida SMTP para tickets y comunicados'}
                </p>
              </div>
            </div>

            <button
              onClick={cerrarNotificaciones}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Vista Principal: Notificaciones vs Correos Despachados */}
          <div className="flex border-b border-slate-200 dark:border-[#1B2F52] bg-slate-100/60 dark:bg-[#071324] px-4 pt-2 gap-2 text-xs font-bold shrink-0">
            <button
              onClick={() => setVistaPrincipal('notifs')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-2 ${
                vistaPrincipal === 'notifs'
                  ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] bg-white dark:bg-[#0B1E3B] rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notificaciones en App</span>
              {noLeidasCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#F37021] text-white">
                  {noLeidasCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setVistaPrincipal('correos')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-2 ${
                vistaPrincipal === 'correos'
                  ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] bg-white dark:bg-[#0B1E3B] rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Correos SMTP (Simulador)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {correosSimulados.length}
              </span>
            </button>
          </div>

          {/* VISTA 1: NOTIFICACIONES EN APP */}
          {vistaPrincipal === 'notifs' && (
            <>
              {/* Filter Segmented Control & Actions */}
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#1B2F52] flex items-center justify-between bg-white dark:bg-[#0B1E3B] shrink-0 gap-2 overflow-x-auto">
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
                      className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition flex items-center gap-1"
                      title="Limpiar leídas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Limpiar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y-0">
                {notifsFiltradas.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400 dark:text-slate-500">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#081528] flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <Bell className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      Bandeja al día
                    </p>
                    <p className="text-xs max-w-xs leading-relaxed">
                      {filtro === 'no_leidas'
                        ? 'No tienes notificaciones pendientes por leer.'
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

                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                            {notif.titulo}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {notif.mensaje}
                          </p>
                        </div>

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
            </>
          )}

          {/* VISTA 2: CORREOS ELECTRÓNICOS SIMULADOS (SMTP OUTBOX) */}
          {vistaPrincipal === 'correos' && (
            <>
              {/* Buscador & Acciones de Correos */}
              <div className="p-3 border-b border-slate-200 dark:border-[#1B2F52] bg-white dark:bg-[#0B1E3B] flex items-center justify-between gap-2 shrink-0">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busquedaCorreos}
                    onChange={(e) => setBusquedaCorreos(e.target.value)}
                    placeholder="Buscar por destinatario, asunto o ticket..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-[#081528] border border-transparent focus:border-[#1565C0] outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
                  />
                </div>

                {correosSimulados.length > 0 && (
                  <button
                    onClick={limpiarCorreosSimulados}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                    title="Vaciar historial de correos simulados"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                )}
              </div>

              {/* Lista de Correos Despachados */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {correosFiltrados.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400 dark:text-slate-500">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#081528] flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <Send className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      Sin correos en cola
                    </p>
                    <p className="text-xs max-w-xs leading-relaxed">
                      Crea un ticket, responde un mensaje o publica un anuncio para ver los correos despachados en tiempo real por el servicio.
                    </p>
                  </div>
                ) : (
                  correosFiltrados.map((correo) => {
                    const badge = getEmailBadgeInfo(correo.evento);

                    return (
                      <div
                        key={correo.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-[#1A3668] bg-white dark:bg-[#081B3A]/60 shadow-xs hover:border-[#1565C0]/60 transition flex flex-col gap-2.5"
                      >
                        {/* Header: Event Badge & Time */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3" />
                            {tiempoRelativoCO(correo.fechaEnvio)}
                          </span>
                        </div>

                        {/* Recipient & Subject */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Para:</span>
                            <span className="text-[#0B2A5B] dark:text-[#3FA2E8] font-medium">{correo.toName}</span>
                            <span className="text-[11px] text-slate-400 truncate">({correo.to})</span>
                          </div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                            {correo.subject}
                          </h4>
                        </div>

                        {/* Body Preview */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-[#071324] p-2 rounded-lg border border-slate-100 dark:border-[#1A3668]/40">
                          {correo.bodyText}
                        </p>

                        {/* Status & Preview Button */}
                        <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-[#1A3668]/40">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" />
                            Entregado (Simulado)
                          </span>

                          <button
                            type="button"
                            onClick={() => setCorreoSeleccionado(correo)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-[#1565C0] dark:text-[#3FA2E8] font-bold text-xs transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver HTML</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Panel Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-[#1B2F52] bg-slate-50/90 dark:bg-[#081528] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium font-mono">
                COT (GMT-5) • Notificaciones Activas
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

      {/* MODAL DE PREVISUALIZACIÓN DE EMAIL HTML CORPORATIVO */}
      {correoSeleccionado && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setCorreoSeleccionado(null)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1E3B] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1A3668] flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#1A3668] bg-slate-50 dark:bg-[#081528] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#1565C0] text-white uppercase tracking-wider">
                    SIMULADOR DE EMAIL SFS
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {correoSeleccionado.id}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#0B2A5B] dark:text-white mt-1 truncate">
                  {correoSeleccionado.subject}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setCorreoSeleccionado(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cabecera Técnica del Correo */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-[#1A3668]/50 bg-slate-100/50 dark:bg-[#071324] text-xs space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 w-16">De:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{correoSeleccionado.fromName} &lt;{correoSeleccionado.from}&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 w-16">Para:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{correoSeleccionado.toName} &lt;{correoSeleccionado.to}&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 w-16">Fecha:</span>
                <span className="text-slate-600 dark:text-slate-400">{new Date(correoSeleccionado.fechaEnvio).toLocaleString('es-CO', { timeZone: 'America/Bogota' })} (Hora Colombia)</span>
              </div>
            </div>

            {/* Contenedor del HTML del Correo (Iframe / Sandbox Container) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F7FB]">
              <div
                className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: correoSeleccionado.bodyHtml }}
              />
            </div>

            {/* Footer del Modal */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-[#1A3668] bg-white dark:bg-[#0B1E3B] flex items-center justify-between gap-3">
              {correoSeleccionado.ticketId ? (
                <button
                  type="button"
                  onClick={() => handleOpenTicketFromMail(correoSeleccionado.ticketId)}
                  className="px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#1976D2] text-white font-bold text-xs transition flex items-center gap-2 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Ticket en la Plataforma</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setCorreoSeleccionado(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
