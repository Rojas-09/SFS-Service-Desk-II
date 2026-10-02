import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ticket,
  CategoriaTicket,
  PrioridadTicket,
  ModuloAfectado,
  Adjunto,
  EstadoTicket,
} from '../../types';
import {
  formatoFechaHoraCO,
  tiempoRelativoCO,
  calcularEstadoSLA,
  procesarArchivoAdjunto,
  tamanoLegible,
} from '../../lib/utils';
import { FileUploadZone } from '../common/FileUploadZone';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Paperclip,
  Send,
  Star,
  RotateCcw,
  Building2,
  User,
  ArrowLeft,
  X,
  Megaphone,
  UploadCloud,
  ChevronRight,
  HelpCircle,
  FileCheck,
  Calendar,
  Sparkles,
  Bell,
  Download,
  Eye,
} from 'lucide-react';

interface PortalViewProps {
  subView?: 'inicio' | 'nuevo' | 'tickets' | 'detalle';
  ticketId?: string;
}

export const PortalView: React.FC<PortalViewProps> = ({
  subView = 'inicio',
  ticketId,
}) => {
  const {
    currentUser,
    empresas,
    tickets,
    mensajes,
    eventos,
    anuncios,
    usuarios,
    crearTicket,
    agregarMensaje,
    calificarTicket,
    reabrirTicket,
    notificaciones,
    abrirNotificaciones,
    navigate,
  } = useApp();

  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // If current user is not a client, find their associated company or fallback
  const userEmpresaId = currentUser?.empresaId || 'emp-1';
  const empresa = empresas.find((e) => e.id === userEmpresaId);

  // Count unread notifications for this client
  const unreadNotifsCount = currentUser
    ? notificaciones.filter((n) => n.usuarioId === currentUser.id && !n.leida).length
    : 0;

  // Tickets for THIS company only
  const misTicketsEmpresa = useMemo(() => {
    return tickets.filter((t) => t.empresaId === userEmpresaId);
  }, [tickets, userEmpresaId]);

  // Current active announcement for clients
  const [descartadoAnuncioId, setDescartadoAnuncioId] = useState<string | null>(null);
  const anuncioActivo = anuncios.find(
    (a) =>
      a.estado === 'publicado' &&
      a.fijado &&
      a.id !== descartadoAnuncioId &&
      (a.audiencia === 'todas' || (a.empresasIds && a.empresasIds.includes(userEmpresaId)))
  );

  // Stats for the client
  const ticketsAbiertos = misTicketsEmpresa.filter(
    (t) => t.estado !== 'resuelto' && t.estado !== 'cerrado'
  ).length;

  const ticketsEnEsperaCliente = misTicketsEmpresa.filter(
    (t) => t.estado === 'en_espera_cliente'
  ).length;

  const ticketsResueltosEsteMes = misTicketsEmpresa.filter((t) => {
    if (t.estado !== 'resuelto' && t.estado !== 'cerrado') return false;
    const ahora = new Date();
    const d = new Date(t.resueltoEn || t.creadoEn);
    return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
  }).length;

  // New Ticket Form State
  const [nuevoAsunto, setNuevoAsunto] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<CategoriaTicket>('error_sistema');
  const [nuevoModulo, setNuevoModulo] = useState<ModuloAfectado>('ERP SFS Trilla');
  const [nuevaPrioridad, setNuevaPrioridad] = useState<PrioridadTicket>('media');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [adjuntosForm, setAdjuntosForm] = useState<Adjunto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tickets list filters
  const [listSearch, setListSearch] = useState('');
  const [listEstadoFiltro, setListEstadoFiltro] = useState<string>('todos');

  // Detail view state
  const [mensajeCliente, setMensajeCliente] = useState('');
  const [adjuntosChat, setAdjuntosChat] = useState<Adjunto[]>([]);
  const [ratingEstrellas, setRatingEstrellas] = useState(5);
  const [ratingComentario, setRatingComentario] = useState('');
  const [motivoReapertura, setMotivoReapertura] = useState('');
  const [mostrarModalReapertura, setMostrarModalReapertura] = useState(false);

  // Map users
  const usuariosMap = useMemo(() => {
    const map: Record<string, string> = {};
    usuarios.forEach((u) => {
      map[u.id] = `${u.nombre} ${u.apellidos}`;
    });
    return map;
  }, [usuarios]);

  // Handle new ticket submit
  const handleCrearTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAsunto.trim() || !nuevaDescripcion.trim()) return;

    setIsSubmitting(true);
    const nuevo = crearTicket({
      asunto: nuevoAsunto.trim(),
      descripcion: nuevaDescripcion.trim(),
      categoria: nuevaCategoria,
      modulo: nuevoModulo,
      prioridad: nuevaPrioridad,
      adjuntos: adjuntosForm,
    });
    setIsSubmitting(false);

    // Reset and navigate
    setNuevoAsunto('');
    setNuevaDescripcion('');
    setAdjuntosForm([]);
    navigate(`/portal/ticket/${nuevo.id}`);
  };

  const handleChatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nuevos: Adjunto[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      try {
        const adj = await procesarArchivoAdjunto(e.target.files[i]);
        nuevos.push(adj);
      } catch (err) {
        console.error(err);
      }
    }
    if (nuevos.length > 0) {
      setAdjuntosChat((prev) => [...prev, ...nuevos]);
    }
    if (chatFileInputRef.current) {
      chatFileInputRef.current.value = '';
    }
  };

  const handleEnviarMensajeCliente = (e: React.FormEvent, tId: string) => {
    e.preventDefault();
    if (!mensajeCliente.trim() && adjuntosChat.length === 0) return;
    agregarMensaje(tId, mensajeCliente.trim(), false, adjuntosChat);
    setMensajeCliente('');
    setAdjuntosChat([]);
  };

  // Helper for priority badges
  const renderPriorityBadge = (p: PrioridadTicket) => {
    switch (p) {
      case 'critica':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-[#DC2626] dark:bg-red-950 dark:text-red-300">
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-[#F37021] dark:bg-orange-950 dark:text-orange-300">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300">
            Media
          </span>
        );
      case 'baja':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Baja
          </span>
        );
    }
  };

  // Helper for status badges
  const renderStatusBadge = (st: EstadoTicket) => {
    const config: Record<EstadoTicket, { label: string; class: string }> = {
      nuevo: {
        label: 'Radicado',
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
      },
      asignado: {
        label: 'Asignado a especialista',
        class: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
      },
      en_progreso: {
        label: 'En atención técnica',
        class: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300',
      },
      en_espera_cliente: {
        label: 'Esperando tu respuesta',
        class: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 font-bold animate-pulse',
      },
      resuelto: {
        label: 'Resuelto',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
      },
      cerrado: {
        label: 'Cerrado',
        class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
      },
    };
    const c = config[st];
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${c.class}`}>
        {c.label}
      </span>
    );
  };

  // ----------------------------------------------------
  // SUBVIEW: NUEVO TICKET
  // ----------------------------------------------------
  if (subView === 'nuevo') {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1565C0] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al portal</span>
        </button>

        <div className="bg-white dark:bg-[#0E244D] p-6 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#0B2A5B] dark:text-white tracking-tight">
              Crear Nuevo Ticket de Soporte
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Empresa: <strong>{empresa?.nombre}</strong> • Plan de soporte:{' '}
              <span className="text-[#F37021] font-semibold">{empresa?.planSoporte}</span>
            </p>
          </div>

          <form onSubmit={handleCrearTicketSubmit} className="space-y-5">
            {/* Asunto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Asunto del caso *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Inconsistencia al liquidar comprobante de café pergamino"
                value={nuevoAsunto}
                onChange={(e) => setNuevoAsunto(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Grid selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Categoría
                </label>
                <select
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value as CategoriaTicket)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                >
                  <option value="error_sistema">Error del sistema</option>
                  <option value="duda_uso">Duda de uso</option>
                  <option value="solicitud_cambio">Solicitud de cambio</option>
                  <option value="acceso_usuarios">Acceso / usuarios</option>
                  <option value="reportes_dian">Facturación & DIAN</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Módulo afectado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Módulo o Producto
                </label>
                <select
                  value={nuevoModulo}
                  onChange={(e) => setNuevoModulo(e.target.value as ModuloAfectado)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                >
                  <option value="ERP SFS Trilla">ERP SFS Trilla</option>
                  <option value="Facturación Electrónica DIAN">Facturación Electrónica DIAN</option>
                  <option value="Exportaciones & Logística">Exportaciones & Logística</option>
                  <option value="Control de Calidad & Catación">Control de Calidad & Catación</option>
                  <option value="Portal de Proveedores y Caficultores">Portal de Proveedores</option>
                  <option value="Inventarios & Almacén">Inventarios & Almacén</option>
                  <option value="Seguridad & Accesos">Seguridad & Accesos</option>
                  <option value="Infraestructura & Servidores">Infraestructura & Servidores</option>
                </select>
              </div>

              {/* Prioridad sugerida */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Prioridad Sugerida
                </label>
                <select
                  value={nuevaPrioridad}
                  onChange={(e) => setNuevaPrioridad(e.target.value as PrioridadTicket)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                >
                  <option value="baja">Baja (Dudas, mejoras)</option>
                  <option value="media">Media (Operación regular)</option>
                  <option value="alta">Alta (Impacto severo con alternativa)</option>
                  <option value="critica">Crítica (Operación detenida / Despacho bloqueado)</option>
                </select>
              </div>
            </div>

            {/* Descripción enriquecida */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Descripción Detallada *
                </label>
                <span className="text-[11px] text-slate-400">
                  Explica qué ocurrió, los pasos para reproducirlo y el impacto en planta
                </span>
              </div>
              <textarea
                required
                rows={6}
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                placeholder="Describe el incidente con el mayor detalle posible..."
                className="w-full p-3.5 text-sm bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Adjuntos reales con Drag & Drop */}
            <FileUploadZone
              adjuntos={adjuntosForm}
              onAdjuntosChange={setAdjuntosForm}
              label="Adjuntar archivos o capturas del incidente"
              helperText="Selecciona o arrastra capturas de pantalla, archivos PDF, XML de DIAN, planillas o registros (Hasta 25MB por archivo)"
            />

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#1A3668]">
              <button
                type="button"
                onClick={() => navigate('/portal')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#F37021] hover:bg-[#e06114] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Radicar Ticket de Soporte</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBVIEW: DETALLE DEL TICKET (CLIENTE)
  // ----------------------------------------------------
  if (subView === 'detalle' && ticketId) {
    const ticket = misTicketsEmpresa.find((t) => t.id === ticketId);
    if (!ticket) {
      return (
        <div className="p-8 text-center bg-white dark:bg-[#0E244D] rounded-xl border border-slate-200 dark:border-[#1A3668]">
          <AlertTriangle className="w-12 h-12 text-[#F37021] mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Ticket no encontrado</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Este ticket no pertenece a tu empresa o fue removido.
          </p>
          <button
            onClick={() => navigate('/portal')}
            className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg"
          >
            Volver a mis tickets
          </button>
        </div>
      );
    }

    // Only public messages (no internal notes!)
    const ticketMensajesPublicos = mensajes.filter(
      (m) => m.ticketId === ticket.id && !m.interno
    );

    const ticketEventosPublicos = eventos.filter((e) => e.ticketId === ticket.id && e.tipo !== 'nota_interna');

    const isResolved = ticket.estado === 'resuelto' || ticket.estado === 'cerrado';

    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Navigation back */}
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1565C0] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mis Tickets</span>
        </button>

        {/* Header card */}
        <div className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-sm font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                {ticket.numero}
              </span>
              {renderPriorityBadge(ticket.prioridad)}
              {renderStatusBadge(ticket.estado)}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {ticket.modulo}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-[#0B2A5B] dark:text-white leading-tight">
              {ticket.asunto}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Radicado el {formatoFechaHoraCO(ticket.creadoEn)} • Atendido por:{' '}
              <strong>
                {ticket.asignadoAId ? usuariosMap[ticket.asignadoAId] || 'Especialista SFS' : 'En asignación'}
              </strong>
            </p>
          </div>

          {/* Action button if resolved */}
          {isResolved && (
            <button
              onClick={() => setMostrarModalReapertura(true)}
              className="px-3.5 py-2 rounded-xl border border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold transition flex items-center gap-1.5 self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reabrir este ticket</span>
            </button>
          )}
        </div>

        {/* CSAT Survey banner if resolved */}
        {isResolved && (
          <div className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-[#0B2A5B] dark:text-white">
                {ticket.calificacion ? 'Encuesta de Satisfacción Registrada' : '¿Cómo calificarías nuestra atención?'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Tu opinión nos ayuda a garantizar los más altos estándares en el servicio a la industria cafetera.
            </p>

            {ticket.calificacion ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= ticket.calificacion!.estrellas
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {ticket.calificacion.estrellas} de 5 estrellas
                </span>
                {ticket.calificacion.comentario && (
                  <span className="text-xs text-slate-500 italic">
                    - "{ticket.calificacion.comentario}"
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingEstrellas(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= ratingEstrellas
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {ratingEstrellas} {ratingEstrellas === 1 ? 'estrella' : 'estrellas'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un comentario adicional sobre la atención recibida..."
                    value={ratingComentario}
                    onChange={(e) => setRatingComentario(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                  <button
                    onClick={() => calificarTicket(ticket.id, ratingEstrellas, ratingComentario)}
                    className="px-4 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Enviar Calificación
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messaging conversation thread (Client on the RIGHT, SFS on the LEFT) */}
        <div className="bg-white dark:bg-[#0E244D] rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs p-4 md:p-6 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-[#1A3668]">
            Conversación y Respuestas
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {ticketMensajesPublicos.map((msg) => {
              const esMio = msg.autorRol === 'cliente';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-2xs ${
                      esMio
                        ? 'bg-[#1565C0] text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-[#081B3A] text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-[#1A3668]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 text-xs mb-1.5 opacity-90">
                      <span className="font-bold">
                        {esMio ? 'Tú (Cliente)' : `${msg.autorNombre} (Soporte SFS)`}
                      </span>
                      <span className="text-[10px]">{formatoFechaHoraCO(msg.creadoEn)}</span>
                    </div>

                    {/* Body */}
                    <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.cuerpo}
                    </div>

                    {/* Attachments */}
                    {msg.adjuntos && msg.adjuntos.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/20 dark:border-slate-700 flex flex-wrap gap-2">
                        {msg.adjuntos.map((adj) => {
                          const isImg =
                            adj.tipoMime.startsWith('image/') ||
                            ['png', 'jpg', 'jpeg', 'webp', 'gif'].some((ext) =>
                              adj.nombre.toLowerCase().endsWith(ext)
                            );
                          return (
                            <div
                              key={adj.id}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs shadow-2xs ${
                                esMio
                                  ? 'bg-white/20 text-white border border-white/30'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {isImg && adj.url && adj.url.startsWith('data:') ? (
                                <img
                                  src={adj.url}
                                  alt={adj.nombre}
                                  onClick={() => setLightboxImg(adj.url)}
                                  className="w-7 h-7 rounded object-cover cursor-pointer hover:opacity-80 shrink-0"
                                  title="Clic para ampliar imagen"
                                />
                              ) : (
                                <Paperclip className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              )}
                              <span
                                className="font-semibold truncate max-w-[130px] sm:max-w-[200px]"
                                title={adj.nombre}
                              >
                                {adj.nombre}
                              </span>
                              <span className="text-[10px] opacity-75 shrink-0">
                                ({tamanoLegible(adj.tamanoBytes)})
                              </span>
                              {adj.url && adj.url.startsWith('data:') && (
                                <a
                                  href={adj.url}
                                  download={adj.nombre}
                                  className="p-1 hover:opacity-100 opacity-70 transition ml-1 shrink-0"
                                  title="Descargar archivo"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply input */}
          {!isResolved ? (
            <form
              onSubmit={(e) => handleEnviarMensajeCliente(e, ticket.id)}
              className="pt-4 border-t border-slate-200 dark:border-[#1A3668] space-y-3"
            >
              <textarea
                rows={3}
                value={mensajeCliente}
                onChange={(e) => setMensajeCliente(e.target.value)}
                placeholder="Escribe tu mensaje o aclaración para el equipo de soporte SFS..."
                className="w-full p-3.5 text-xs md:text-sm bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
              />

              {/* Attached files preview chips */}
              {adjuntosChat.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {adjuntosChat.map((adj) => (
                    <div
                      key={adj.id}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#1565C0] shrink-0" />
                      <span className="font-semibold truncate max-w-[150px]">{adj.nombre}</span>
                      <span className="text-[10px] text-slate-400">({tamanoLegible(adj.tamanoBytes)})</span>
                      <button
                        type="button"
                        onClick={() => setAdjuntosChat((prev) => prev.filter((a) => a.id !== adj.id))}
                        className="text-slate-400 hover:text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <input
                  ref={chatFileInputRef}
                  type="file"
                  multiple
                  onChange={handleChatFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.xml,.txt,.csv,.log,.zip"
                />
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A3668] bg-slate-50 dark:bg-[#081B3A] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1565C0] hover:text-[#1565C0] transition"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Adjuntar archivo o captura</span>
                  {adjuntosChat.length > 0 && (
                    <span className="font-bold text-[#1565C0]">({adjuntosChat.length})</span>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={!mensajeCliente.trim() && adjuntosChat.length === 0}
                  className="px-5 py-2 bg-[#1565C0] hover:bg-[#1976D2] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar respuesta</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-[#081B3A] rounded-xl text-center text-xs text-slate-500">
              Este caso se encuentra resuelto. Si el problema persiste o requieres asistencia adicional, haz clic en "Reabrir este ticket".
            </div>
          )}
        </div>

        {/* Reopen Modal */}
        {mostrarModalReapertura && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0E244D] p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reabrir Ticket {ticket.numero}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Por favor indícanos brevemente qué inconsistencia persiste o por qué se reabre el caso.
              </p>
              <textarea
                rows={3}
                value={motivoReapertura}
                onChange={(e) => setMotivoReapertura(e.target.value)}
                placeholder="Ej: Al timbrar el lote posterior volvió a salir el mismo código de error..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setMostrarModalReapertura(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  disabled={!motivoReapertura.trim()}
                  onClick={() => {
                    reabrirTicket(ticket.id, motivoReapertura.trim());
                    setMostrarModalReapertura(false);
                    setMotivoReapertura('');
                  }}
                  className="px-4 py-1.5 bg-[#F37021] hover:bg-[#e06114] disabled:opacity-50 text-white text-xs font-bold rounded-lg"
                >
                  Confirmar Reapertura
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBVIEW: INICIO / BANDEJA CLIENTE (DEFAULT)
  // ----------------------------------------------------
  const filteredClientTickets = misTicketsEmpresa.filter((t) => {
    if (listSearch) {
      const q = listSearch.toLowerCase();
      if (!t.numero.toLowerCase().includes(q) && !t.asunto.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (listEstadoFiltro === 'abiertos') {
      return t.estado !== 'resuelto' && t.estado !== 'cerrado';
    }
    if (listEstadoFiltro === 'espera') {
      return t.estado === 'en_espera_cliente';
    }
    if (listEstadoFiltro === 'resueltos') {
      return t.estado === 'resuelto' || t.estado === 'cerrado';
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Active announcement banner (dismissible) */}
      {anuncioActivo && (
        <div className="relative p-4 md:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 shadow-xs flex items-start gap-3.5 animate-in fade-in">
          <Megaphone className="w-5 h-5 text-[#F37021] shrink-0 mt-0.5" />
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                Comunicado SFS
              </span>
              <h2 className="text-sm font-bold">{anuncioActivo.titulo}</h2>
            </div>
            <div
              className="text-xs mt-1.5 leading-relaxed text-amber-900 dark:text-amber-200"
              dangerouslySetInnerHTML={{ __html: anuncioActivo.cuerpo }}
            />
          </div>
          <button
            onClick={() => setDescartadoAnuncioId(anuncioActivo.id)}
            className="absolute top-3 right-3 text-amber-700 hover:text-amber-950 dark:text-amber-400 p-1"
            title="Descartar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Greeting & Action Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] to-[#1565C0] text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-[#F37021]" />
            <span>{empresa?.nombre || 'Portal de Clientes'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Hola, {currentUser?.nombre || 'Usuario'}
          </h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-xl">
            Bienvenido a tu mesa de ayuda SFS. Consulta el estado de tus casos o radica una nueva solicitud con soporte técnico prioritario.
          </p>
        </div>

        {/* Big Orange "Nuevo ticket" button */}
        <button
          onClick={() => navigate('/portal/nuevo')}
          className="px-6 py-3.5 bg-[#F37021] hover:bg-[#ff7e33] active:scale-95 text-white font-bold text-sm md:text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Radicar Nuevo Ticket</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Abiertos */}
        <div
          onClick={() => setListEstadoFiltro('abiertos')}
          className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs cursor-pointer hover:border-[#1565C0] transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1565C0] dark:text-[#3FA2E8]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B2A5B] dark:text-white">
              {ticketsAbiertos}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tickets Abiertos
            </div>
          </div>
        </div>

        {/* En espera de mi respuesta */}
        <div
          onClick={() => setListEstadoFiltro('espera')}
          className={`p-5 rounded-2xl border shadow-xs cursor-pointer transition flex items-center gap-4 ${
            ticketsEnEsperaCliente > 0
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 hover:border-amber-500'
              : 'bg-white dark:bg-[#0E244D] border-slate-200 dark:border-[#1A3668] hover:border-amber-400'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B2A5B] dark:text-white">
              {ticketsEnEsperaCliente}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              En espera de tu respuesta
            </div>
          </div>
        </div>

        {/* Resueltos este mes */}
        <div
          onClick={() => setListEstadoFiltro('resueltos')}
          className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs cursor-pointer hover:border-emerald-500 transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-[#16A34A]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0B2A5B] dark:text-white">
              {ticketsResueltosEsteMes}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Resueltos este mes
            </div>
          </div>
        </div>

        {/* Notificaciones & Alertas (Relocated with superior experience!) */}
        <div
          onClick={abrirNotificaciones}
          className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs cursor-pointer hover:border-[#F37021] transition flex items-center justify-between group"
          title="Abrir Centro de Notificaciones"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-[#F37021]">
              <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B2A5B] dark:text-white flex items-center gap-1.5">
                <span>{unreadNotifsCount}</span>
                {unreadNotifsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F37021] text-white animate-pulse">
                    Nuevas
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Notificaciones & Alertas
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#F37021] transition" />
        </div>
      </div>

      {/* Tickets List Section */}
      <div className="bg-white dark:bg-[#0E244D] rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 md:p-5 border-b border-slate-200 dark:border-[#1A3668] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setListEstadoFiltro('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                listEstadoFiltro === 'todos'
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Todos ({misTicketsEmpresa.length})
            </button>
            <button
              onClick={() => setListEstadoFiltro('abiertos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                listEstadoFiltro === 'abiertos'
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Abiertos ({ticketsAbiertos})
            </button>
            <button
              onClick={() => setListEstadoFiltro('espera')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                listEstadoFiltro === 'espera'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              En espera ({ticketsEnEsperaCliente})
            </button>
            <button
              onClick={() => setListEstadoFiltro('resueltos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                listEstadoFiltro === 'resueltos'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Resueltos ({misTicketsEmpresa.filter((t) => t.estado === 'resuelto' || t.estado === 'cerrado').length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar en mis tickets..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Tickets Rows */}
        <div className="divide-y divide-slate-100 dark:divide-[#1A3668]">
          {filteredClientTickets.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No hay tickets en este estado
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Usa el botón "Radicar Nuevo Ticket" para solicitar soporte técnico a nuestro equipo.
              </p>
            </div>
          ) : (
            filteredClientTickets.map((t) => {
              const agente = t.asignadoAId ? usuariosMap[t.asignadoAId] : null;

              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/portal/ticket/${t.id}`)}
                  className="p-4 md:p-5 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                        {t.numero}
                      </span>
                      {renderPriorityBadge(t.prioridad)}
                      {renderStatusBadge(t.estado)}
                      <span className="text-[11px] text-slate-400">
                        {t.modulo}
                      </span>
                    </div>

                    <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1565C0] dark:group-hover:text-[#3FA2E8] transition leading-snug">
                      {t.asunto}
                    </h2>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span>Última actualización: {tiempoRelativoCO(t.actualizadoEn)}</span>
                      <span>•</span>
                      <span>
                        Atiende:{' '}
                        <strong>
                          {agente ? agente.split(' ')[0] + ' (SFS)' : 'Asignando especialista'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-slate-400 group-hover:text-[#1565C0] dark:group-hover:text-[#3FA2E8] font-semibold hidden md:inline">
                      Ver caso
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#1565C0] transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-[#0E244D] p-2 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImg}
              alt="Evidencia ampliada"
              className="max-h-[82vh] w-auto rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
