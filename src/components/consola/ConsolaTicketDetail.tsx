import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EstadoTicket,
  PrioridadTicket,
  CategoriaTicket,
  Adjunto,
} from '../../types';
import {
  formatoFechaHoraCO,
  tiempoRelativoCO,
  calcularEstadoSLA,
  procesarArchivoAdjunto,
  tamanoLegible,
} from '../../lib/utils';
import {
  ArrowLeft,
  Lock,
  Send,
  Paperclip,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Tag,
  CheckCircle2,
  FileText,
  History,
  Zap,
  UserCheck,
  ChevronDown,
  ShieldAlert,
  Star,
  RefreshCw,
  FolderOpen,
  Download,
  Eye,
  X,
} from 'lucide-react';

interface ConsolaTicketDetailProps {
  ticketId: string;
}

export const ConsolaTicketDetail: React.FC<ConsolaTicketDetailProps> = ({ ticketId }) => {
  const {
    tickets,
    mensajes,
    eventos,
    empresas,
    usuarios,
    currentUser,
    macros,
    asignarTicket,
    cambiarEstadoTicket,
    actualizarTicket,
    agregarMensaje,
    navigate,
  } = useApp();

  // Find ticket
  const ticket = tickets.find((t) => t.id === ticketId);

  // Split panel tab: 'respuesta' | 'nota_interna'
  const [activeTab, setActiveTab] = useState<'respuesta' | 'nota_interna'>('respuesta');
  const [cuerpoMensaje, setCuerpoMensaje] = useState('');
  const [selectedMacroId, setSelectedMacroId] = useState('');
  const [archivosSimulados, setArchivosSimulados] = useState<Adjunto[]>([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const agentFileInputRef = React.useRef<HTMLInputElement>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Right sidebar tab: 'ficha' | 'historial' | 'relacionados'
  const [fichaTab, setFichaTab] = useState<'ficha' | 'historial' | 'relacionados'>('ficha');

  if (!ticket) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0E244D] rounded-xl border border-slate-200 dark:border-[#1A3668]">
        <AlertTriangle className="w-12 h-12 text-[#F37021] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ticket no encontrado</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">El ticket con ID {ticketId} no existe o fue eliminado.</p>
        <button
          onClick={() => navigate('/consola/bandeja')}
          className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg"
        >
          Volver a la bandeja
        </button>
      </div>
    );
  }

  const empresa = empresas.find((e) => e.id === ticket.empresaId);
  const creador = usuarios.find((u) => u.id === ticket.creadoPorId);
  const asignado = ticket.asignadoAId ? usuarios.find((u) => u.id === ticket.asignadoAId) : null;
  const agentesList = usuarios.filter((u) => u.rol === 'agente' || u.rol === 'supervisor');

  // Messages for this ticket
  const ticketMensajes = mensajes.filter((m) => m.ticketId === ticket.id);
  const ticketEventos = eventos.filter((e) => e.ticketId === ticket.id).sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  );

  // Related tickets for the same company
  const ticketsRelacionados = tickets.filter(
    (t) => t.empresaId === ticket.empresaId && t.id !== ticket.id
  ).slice(0, 5);

  // Realtime SLA calculations
  const slaRespInfo = calcularEstadoSLA(ticket.slaPrimeraRespuestaVence, ticket.primeraRespuestaEn);
  const slaSolInfo = calcularEstadoSLA(ticket.slaSolucionVence, ticket.resueltoEn);

  // Apply macro
  const handleApplyMacro = (mId: string) => {
    setSelectedMacroId(mId);
    const macro = macros.find((m) => m.id === mId);
    if (macro) {
      const clienteNombre = creador ? creador.nombre : 'Cliente';
      const texto = macro.contenido
        .replace(/{cliente}/g, clienteNombre)
        .replace(/{ticket}/g, ticket.numero);
      setCuerpoMensaje((prev) => (prev ? `${prev}\n\n${texto}` : texto));
    }
  };

  const handleEnviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuerpoMensaje.trim() && archivosSimulados.length === 0) return;

    agregarMensaje(ticket.id, cuerpoMensaje.trim(), activeTab === 'nota_interna', archivosSimulados);
    setCuerpoMensaje('');
    setArchivosSimulados([]);
    setSelectedMacroId('');
  };

  const handleAgentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setArchivosSimulados((prev) => [...prev, ...nuevos]);
    }
    if (agentFileInputRef.current) {
      agentFileInputRef.current.value = '';
    }
  };

  const handleAddEtiqueta = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nuevaEtiqueta.trim()) {
      e.preventDefault();
      const clean = nuevaEtiqueta.trim();
      if (!ticket.etiquetas.includes(clean)) {
        actualizarTicket(ticket.id, {
          etiquetas: [...ticket.etiquetas, clean],
        });
      }
      setNuevaEtiqueta('');
    }
  };

  const handleRemoveEtiqueta = (tagToRemove: string) => {
    actualizarTicket(ticket.id, {
      etiquetas: ticket.etiquetas.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E244D] p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/consola/bandeja')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A3668] hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
            aria-label="Volver a la bandeja"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm md:text-base font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                {ticket.numero}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {ticket.modulo}
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-[#0B2A5B] dark:text-white leading-tight mt-0.5">
              {ticket.asunto}
            </h1>
          </div>
        </div>

        {/* Quick status button & assign */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">Estado:</span>
            <select
              value={ticket.estado}
              onChange={(e) => cambiarEstadoTicket(ticket.id, e.target.value as EstadoTicket)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#081B3A] border border-slate-300 dark:border-[#1A3668] text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1565C0]"
            >
              <option value="nuevo">Nuevo</option>
              <option value="asignado">Asignado</option>
              <option value="en_progreso">En progreso</option>
              <option value="en_espera_cliente">En espera cliente</option>
              <option value="resuelto">Resuelto ✅</option>
              <option value="cerrado">Cerrado 🔒</option>
            </select>
          </div>

          {/* Quick "Tomar ticket" or Reassign */}
          {!ticket.asignadoAId ? (
            <button
              onClick={() => currentUser && asignarTicket(ticket.id, currentUser.id)}
              className="px-3 py-1.5 bg-[#F37021] hover:bg-[#e06114] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tomar ticket</span>
            </button>
          ) : ticket.asignadoAId !== currentUser?.id ? (
            <button
              onClick={() => currentUser && asignarTicket(ticket.id, currentUser.id)}
              className="px-3 py-1.5 border border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold rounded-lg transition"
            >
              Asignarme a mí
            </button>
          ) : null}
        </div>
      </div>

      {/* Split panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANEL: Conversation Thread & Editor (Cols 1-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Thread messages container */}
          <div className="bg-white dark:bg-[#0E244D] rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs p-4 space-y-4 min-h-[400px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A3668]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1565C0] dark:text-[#3FA2E8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Hilo de Comunicación ({ticketMensajes.length} {ticketMensajes.length === 1 ? 'mensaje' : 'mensajes'})
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Creado {tiempoRelativoCO(ticket.creadoEn)}
              </span>
            </div>

            {/* Messages list */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {ticketMensajes.map((msg) => {
                const esInterno = msg.interno;
                const esCliente = msg.autorRol === 'cliente';

                return (
                  <div
                    key={msg.id}
                    className={`rounded-xl p-4 transition ${
                      esInterno
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800'
                        : esCliente
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60'
                        : 'bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668]'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                            esInterno
                              ? 'bg-amber-600'
                              : esCliente
                              ? 'bg-[#1565C0]'
                              : 'bg-[#0B2A5B]'
                          }`}
                        >
                          {msg.autorNombre[0]}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {msg.autorNombre}
                          </span>
                          {esInterno ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                              <Lock className="w-2.5 h-2.5" />
                              Nota Interna SFS (Privada)
                            </span>
                          ) : esCliente ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300">
                              Cliente ({empresa ? empresa.nombre.split(' ')[0] : 'Cliente'})
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Equipo SFS
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatoFechaHoraCO(msg.creadoEn)}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {msg.cuerpo}
                    </div>

                    {/* Attachments */}
                    {msg.adjuntos && msg.adjuntos.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap gap-2">
                        {msg.adjuntos.map((adj) => {
                          const isImg =
                            adj.tipoMime.startsWith('image/') ||
                            ['png', 'jpg', 'jpeg', 'webp', 'gif'].some((ext) =>
                              adj.nombre.toLowerCase().endsWith(ext)
                            );
                          return (
                            <div
                              key={adj.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-xs text-slate-700 dark:text-slate-200 shadow-2xs"
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
                                <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className="font-semibold truncate max-w-[140px] sm:max-w-[200px]" title={adj.nombre}>
                                {adj.nombre}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                ({tamanoLegible(adj.tamanoBytes)})
                              </span>
                              {adj.url && adj.url.startsWith('data:') && (
                                <a
                                  href={adj.url}
                                  download={adj.nombre}
                                  className="p-1 hover:text-[#1565C0] text-slate-400 transition ml-0.5"
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
                );
              })}
            </div>
          </div>

          {/* Response / Internal Note Editor Tabs */}
          <div className="bg-white dark:bg-[#0E244D] rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs overflow-hidden">
            {/* Tabs bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1A3668] px-4 pt-2 bg-slate-50/70 dark:bg-[#081B3A]/60">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('respuesta')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                    activeTab === 'respuesta'
                      ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Respuesta al Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nota_interna')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'nota_interna'
                      ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Nota Interna (Confidencial)</span>
                </button>
              </div>

              {/* Predefined Macros dropdown */}
              <div className="flex items-center gap-1.5 pb-2">
                <Zap className="w-3.5 h-3.5 text-[#F37021]" />
                <select
                  value={selectedMacroId}
                  onChange={(e) => handleApplyMacro(e.target.value)}
                  className="px-2 py-1 text-[11px] bg-white dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">Insertar respuesta rápida (Macro)...</option>
                  {macros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.atajo} - {m.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note banner notice */}
            {activeTab === 'nota_interna' && (
              <div className="bg-amber-100/90 dark:bg-amber-950/70 border-b border-amber-300 dark:border-amber-800 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
                <span>
                  <strong>Nota interna:</strong> Solo visible para el equipo de soporte e ingeniería SFS. El cliente NO podrá ver este contenido.
                </span>
              </div>
            )}

            {/* Textarea & Submit */}
            <form onSubmit={handleEnviarMensaje} className="p-4 space-y-3">
              <textarea
                rows={4}
                value={cuerpoMensaje}
                onChange={(e) => setCuerpoMensaje(e.target.value)}
                placeholder={
                  activeTab === 'nota_interna'
                    ? 'Escribe notas técnicas internas, hallazgos en logs, acuerdos de equipo...'
                    : 'Escribe tu respuesta formal para el cliente...'
                }
                className={`w-full p-3 text-xs md:text-sm rounded-xl border focus:outline-none transition ${
                  activeTab === 'nota_interna'
                    ? 'bg-amber-50/50 dark:bg-[#121c2d] border-amber-300 dark:border-amber-800/80 focus:border-amber-500'
                    : 'bg-white dark:bg-[#081B3A] border-slate-200 dark:border-[#1A3668] focus:border-[#1565C0]'
                } text-slate-800 dark:text-slate-100`}
              />

              {/* Attached files preview chips */}
              {archivosSimulados.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {archivosSimulados.map((a) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <Paperclip className="w-3 h-3 text-[#1565C0]" />
                      <span className="font-semibold truncate max-w-[150px]">{a.nombre}</span>
                      <span className="text-[10px] text-slate-400">({tamanoLegible(a.tamanoBytes)})</span>
                      <button
                        type="button"
                        onClick={() =>
                          setArchivosSimulados((prev) => prev.filter((i) => i.id !== a.id))
                        }
                        className="text-slate-400 hover:text-red-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons with real file input */}
              <div className="flex items-center justify-between pt-1">
                <input
                  ref={agentFileInputRef}
                  type="file"
                  multiple
                  onChange={handleAgentFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.xml,.txt,.csv,.log,.zip"
                />
                <button
                  type="button"
                  onClick={() => agentFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A3668] bg-slate-50 dark:bg-[#081B3A] text-xs text-slate-700 dark:text-slate-300 hover:border-[#1565C0] hover:text-[#1565C0] transition font-medium"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Adjuntar log / captura / archivo</span>
                  {archivosSimulados.length > 0 && (
                    <span className="font-bold text-[#1565C0]">({archivosSimulados.length})</span>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!cuerpoMensaje.trim() && archivosSimulados.length === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${
                      activeTab === 'nota_interna'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-[#1565C0] hover:bg-[#1976D2]'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{activeTab === 'nota_interna' ? 'Guardar Nota Interna' : 'Enviar al Cliente'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Ficha / SLA / Audit / Related (Cols 9-12) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tabs for right panel */}
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFichaTab('ficha')}
              className={`flex-1 py-1 text-center text-xs font-bold rounded-lg transition ${
                fichaTab === 'ficha'
                  ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] dark:text-[#3FA2E8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Ficha Técnica
            </button>
            <button
              onClick={() => setFichaTab('historial')}
              className={`flex-1 py-1 text-center text-xs font-bold rounded-lg transition ${
                fichaTab === 'historial'
                  ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] dark:text-[#3FA2E8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Historial ({ticketEventos.length})
            </button>
            <button
              onClick={() => setFichaTab('relacionados')}
              className={`flex-1 py-1 text-center text-xs font-bold rounded-lg transition ${
                fichaTab === 'relacionados'
                  ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] dark:text-[#3FA2E8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Relacionados ({ticketsRelacionados.length})
            </button>
          </div>

          {/* SLA Realtime Countdown Card */}
          <div className="bg-white dark:bg-[#0E244D] p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1A3668]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F37021]" />
                Reloj de SLA Colombia
              </span>
              {slaSolInfo.estado === 'vencido' && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-red-600 text-white animate-pulse">
                  SLA VENCIDO
                </span>
              )}
            </div>

            {/* SLA Primera Respuesta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">1ra Respuesta:</span>
                <span className={`font-semibold ${slaRespInfo.colorClase}`}>
                  {ticket.primeraRespuestaEn ? 'Cumplido' : slaRespInfo.tiempoRestanteTexto}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Límite: {formatoFechaHoraCO(ticket.slaPrimeraRespuestaVence)}
              </div>
            </div>

            {/* SLA Solución Definitiva */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-[#1A3668]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Solución:</span>
                <span className={`font-semibold ${slaSolInfo.colorClase}`}>
                  {ticket.resueltoEn ? 'Resuelto' : slaSolInfo.tiempoRestanteTexto}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Límite: {formatoFechaHoraCO(ticket.slaSolucionVence)}
              </div>
            </div>
          </div>

          {/* TAB 1: FICHA */}
          {fichaTab === 'ficha' && (
            <div className="bg-white dark:bg-[#0E244D] p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-4 text-xs">
              {/* Empresa info */}
              <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-[#1A3668]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Empresa Cliente
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-[#1565C0] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {empresa?.nombre}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      NIT: {empresa?.nit} • Plan {empresa?.planSoporte}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {empresa?.ciudad}, {empresa?.departamento}
                    </div>
                  </div>
                </div>
              </div>

              {/* Solicitante info */}
              <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-[#1A3668]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Contacto Solicitante
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {creador?.nombre} {creador?.apellidos}
                    </div>
                    <div className="text-[11px] text-slate-500">{creador?.cargo}</div>
                    <div className="text-[11px] text-slate-400">{creador?.email}</div>
                  </div>
                </div>
              </div>

              {/* Agente asignado selector */}
              <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-[#1A3668]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Especialista Asignado
                </div>
                <select
                  value={ticket.asignadoAId || ''}
                  onChange={(e) => asignarTicket(ticket.id, e.target.value || null)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-[#1565C0]"
                >
                  <option value="">Sin asignar (En cola libre)</option>
                  {agentesList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.apellidos} ({a.cargo.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridad selector */}
              <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-[#1A3668]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Prioridad
                </div>
                <select
                  value={ticket.prioridad}
                  onChange={(e) =>
                    actualizarTicket(ticket.id, { prioridad: e.target.value as PrioridadTicket })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  <option value="critica">Crítica (1h / 4h)</option>
                  <option value="alta">Alta (4h / 24h)</option>
                  <option value="media">Media (8h / 72h)</option>
                  <option value="baja">Baja (24h / 120h)</option>
                </select>
              </div>

              {/* Categoría selector */}
              <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-[#1A3668]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Categoría
                </div>
                <select
                  value={ticket.categoria}
                  onChange={(e) =>
                    actualizarTicket(ticket.id, { categoria: e.target.value as CategoriaTicket })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
                >
                  <option value="error_sistema">Error del sistema</option>
                  <option value="duda_uso">Duda de uso</option>
                  <option value="solicitud_cambio">Solicitud de cambio</option>
                  <option value="acceso_usuarios">Acceso / usuarios</option>
                  <option value="reportes_dian">Facturación & DIAN</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Tags Editor */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Etiquetas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.etiquetas.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveEtiqueta(tag)}
                        className="text-slate-400 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="+ Agregar etiqueta y Enter..."
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyDown={handleAddEtiqueta}
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none"
                />
              </div>

              {/* CSAT Survey score if resolved */}
              {ticket.calificacion && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1">
                    Calificación CSAT del Cliente
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= ticket.calificacion!.estrellas
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold ml-1.5 text-slate-800 dark:text-slate-100">
                      {ticket.calificacion.estrellas} / 5
                    </span>
                  </div>
                  {ticket.calificacion.comentario && (
                    <p className="text-xs italic text-slate-600 dark:text-slate-300">
                      "{ticket.calificacion.comentario}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORIAL / AUDIT TRAIL */}
          {fichaTab === 'historial' && (
            <div className="bg-white dark:bg-[#0E244D] p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Auditoría de Eventos
              </div>
              <div className="relative pl-4 space-y-4 border-l-2 border-slate-200 dark:border-[#1A3668]">
                {ticketEventos.map((evt) => (
                  <div key={evt.id} className="relative text-xs">
                    <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#1565C0] ring-4 ring-white dark:ring-[#0E244D]" />
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {evt.descripcion}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>Por: {evt.usuarioNombre}</span>
                      <span>{tiempoRelativoCO(evt.creadoEn)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TICKETS RELACIONADOS */}
          {fichaTab === 'relacionados' && (
            <div className="bg-white dark:bg-[#0E244D] p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-2.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Otros Casos de {empresa?.nombre.split(' ')[0]}
              </div>
              {ticketsRelacionados.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No hay otros tickets registrados para esta empresa.
                </div>
              ) : (
                ticketsRelacionados.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/consola/ticket/${rel.id}`)}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-[#1A3668] hover:border-[#1565C0] hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                        {rel.numero}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rel.estado}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                      {rel.asunto}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {tiempoRelativoCO(rel.actualizadoEn)}
                    </div>
                  </div>
                ))
              )}
            </div>
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
