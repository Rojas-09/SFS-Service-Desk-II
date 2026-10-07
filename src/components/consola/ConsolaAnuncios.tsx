import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TipoAnuncio,
  AudienciaAnuncio,
  CanalAnuncio,
  Anuncio,
} from '../../types';
import {
  formatoFechaHoraCO,
  tiempoRelativoCO,
} from '../../lib/utils';
import {
  Megaphone,
  PlusCircle,
  Eye,
  Mail,
  Pin,
  Clock,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building2,
  Users,
  Send,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

export const ConsolaAnuncios: React.FC = () => {
  const { anuncios, empresas, usuarios, currentUser, crearAnuncio, eliminarAnuncio } = useApp();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'banner' | 'correo'>('banner');

  // Form state
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [tipo, setTipo] = useState<TipoAnuncio>('informativo');
  const [audiencia, setAudiencia] = useState<AudienciaAnuncio>('todas');
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState<string[]>([]);
  const [canales, setCanales] = useState<CanalAnuncio>('ambos');
  const [fijado, setFijado] = useState(true);
  const [diasDuracion, setDiasDuracion] = useState(7);

  // Recipient calculation
  const destinatariosCalculados = useMemo(() => {
    let usuariosDestino = usuarios.filter((u) => u.rol === 'cliente' && u.activo);
    if (audiencia === 'empresas_seleccionadas') {
      usuariosDestino = usuariosDestino.filter(
        (u) => u.empresaId && empresasSeleccionadas.includes(u.empresaId)
      );
    }
    const empresasAfectadas = new Set(
      usuariosDestino.map((u) => u.empresaId).filter(Boolean)
    );
    return {
      totalUsuarios: usuariosDestino.length,
      totalEmpresas: empresasAfectadas.size,
    };
  }, [usuarios, audiencia, empresasSeleccionadas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !cuerpo.trim()) return;

    const ahora = new Date();
    const expira = new Date(ahora.getTime() + diasDuracion * 24 * 3600 * 1000);

    crearAnuncio({
      titulo: titulo.trim(),
      cuerpo: cuerpo.trim(),
      tipo,
      audiencia,
      empresasIds: audiencia === 'empresas_seleccionadas' ? empresasSeleccionadas : undefined,
      canales,
      publicarEn: ahora.toISOString(),
      expiraEn: expira.toISOString(),
      fijado,
      estado: 'publicado',
      creadoPorId: currentUser?.id || 'usr-sfs-1',
    });

    // Reset
    setTitulo('');
    setCuerpo('');
    setModalAbierto(false);
  };

  const getTipoBadge = (t: TipoAnuncio) => {
    switch (t) {
      case 'informativo':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300">
            Informativo
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Mantenimiento Programado
          </span>
        );
      case 'incidente':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            Incidente Operativo
          </span>
        );
      case 'novedad':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Novedad de Producto
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B2A5B] dark:text-white tracking-tight flex items-baseline gap-2">
            <span>Anuncios & Comunicados Masivos</span>
            <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
              ({anuncios.length} registrados)
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Publica avisos prioritarios en el portal del cliente y despacha notificaciones por correo electrónico
          </p>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 bg-[#F37021] hover:bg-[#e06114] text-white text-xs md:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Nuevo Anuncio</span>
        </button>
      </div>

      {/* Announcements History Table */}
      <div className="bg-white dark:bg-[#0E244D] rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-[#1A3668]">
          <h2 className="text-sm font-bold text-[#0B2A5B] dark:text-white">
            Historial de Comunicados Emitidos
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-[#081B3A] text-slate-500 font-semibold border-b border-slate-200 dark:border-[#1A3668]">
              <tr>
                <th className="p-3.5">Título & Mensaje</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Audiencia</th>
                <th className="p-3.5">Canales</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-center">Enviados</th>
                <th className="p-3.5 text-center">Leídos</th>
                <th className="p-3.5">Publicado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1A3668]">
              {anuncios.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 max-w-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                      {a.fijado && <Pin className="w-3.5 h-3.5 text-[#F37021] shrink-0" />}
                      <span className="line-clamp-1">{a.titulo}</span>
                    </div>
                    <div
                      className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5"
                      dangerouslySetInnerHTML={{ __html: a.cuerpo.replace(/<[^>]+>/g, '') }}
                    />
                  </td>
                  <td className="p-3.5">{getTipoBadge(a.tipo)}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {a.audiencia === 'todas'
                      ? 'Todas las empresas'
                      : `${a.empresasIds?.length || 0} empresas`}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    <span className="capitalize">{a.canales}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          a.estado === 'publicado' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span
                        className={
                          a.estado === 'publicado'
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {a.estado === 'publicado' ? 'Publicado' : a.estado}
                      </span>
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-semibold text-[#1565C0] dark:text-[#3FA2E8]">
                    {a.enviados}
                  </td>
                  <td className="p-3.5 text-center font-semibold text-emerald-600">
                    {a.leidos}
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {formatoFechaHoraCO(a.publicarEn)}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => eliminarAnuncio(a.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Eliminar comunicado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ANNOUNCEMENT MODAL WITH LIVE PREVIEW */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E244D] rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            {/* Modal header */}
            <div className="p-5 border-b border-slate-200 dark:border-[#1A3668] flex items-center justify-between bg-slate-50/70 dark:bg-[#081B3A]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#F37021]" />
                <h3 className="font-bold text-base text-[#0B2A5B] dark:text-white">
                  Crear y Emitir Anuncio Masivo
                </h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Form & Live Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#1A3668]">
              {/* Left Column: Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Título */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Título del Anuncio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mantenimiento Programado Servidor Central DIAN"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Tipo & Canales */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                      Tipo
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoAnuncio)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                    >
                      <option value="informativo">Informativo (Azul)</option>
                      <option value="mantenimiento">Mantenimiento (Ámbar)</option>
                      <option value="incidente">Incidente (Naranja/Rojo)</option>
                      <option value="novedad">Novedad Producto (Verde)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                      Canales
                    </label>
                    <select
                      value={canales}
                      onChange={(e) => setCanales(e.target.value as CanalAnuncio)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                    >
                      <option value="ambos">Portal + Correo</option>
                      <option value="banner">Solo Banner en Portal</option>
                      <option value="correo">Solo Correo Electrónico</option>
                    </select>
                  </div>
                </div>

                {/* Audiencia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Audiencia
                  </label>
                  <select
                    value={audiencia}
                    onChange={(e) => setAudiencia(e.target.value as AudienciaAnuncio)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  >
                    <option value="todas">Todas las Empresas Clientes</option>
                    <option value="empresas_seleccionadas">Empresas Seleccionadas</option>
                  </select>

                  {audiencia === 'empresas_seleccionadas' && (
                    <div className="mt-2 space-y-1 p-2 bg-slate-50 dark:bg-[#081B3A] rounded-xl border border-slate-200 dark:border-[#1A3668] text-xs">
                      {empresas.map((emp) => (
                        <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={empresasSeleccionadas.includes(emp.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEmpresasSeleccionadas((prev) => [...prev, emp.id]);
                              } else {
                                setEmpresasSeleccionadas((prev) =>
                                  prev.filter((i) => i !== emp.id)
                                );
                              }
                            }}
                          />
                          <span>{emp.nombre}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Mensaje / Contenido *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={cuerpo}
                    onChange={(e) => setCuerpo(e.target.value)}
                    placeholder="Escribe el mensaje claro para los directores de trilla y tecnología..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Fijar arriba y vigencia */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={fijado}
                      onChange={(e) => setFijado(e.target.checked)}
                      className="rounded"
                    />
                    <span>Fijar arriba en el portal</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Vigencia:</span>
                    <select
                      value={diasDuracion}
                      onChange={(e) => setDiasDuracion(Number(e.target.value))}
                      className="px-2 py-1 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 rounded-lg text-xs"
                    >
                      <option value={3}>3 días</option>
                      <option value={7}>7 días</option>
                      <option value={15}>15 días</option>
                      <option value={30}>30 días</option>
                    </select>
                  </div>
                </div>

                {/* Recipient summary confirmation callout */}
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-[#0B2A5B] dark:text-blue-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1565C0] shrink-0" />
                  <span>
                    Se emitirá a <strong>{destinatariosCalculados.totalUsuarios} usuarios</strong> de{' '}
                    <strong>{destinatariosCalculados.totalEmpresas} empresas clientes</strong>.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F37021] hover:bg-[#e06114] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar Anuncio</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Live Previews */}
              <div className="p-5 flex flex-col justify-between bg-slate-50/50 dark:bg-[#081B3A]/40 max-h-[75vh] overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Vista Previa en Tiempo Real
                    </span>
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setActivePreviewTab('banner')}
                        className={`px-2.5 py-1 rounded ${
                          activePreviewTab === 'banner'
                            ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Banner Portal
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePreviewTab('correo')}
                        className={`px-2.5 py-1 rounded ${
                          activePreviewTab === 'correo'
                            ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Plantilla Email
                      </button>
                    </div>
                  </div>

                  {activePreviewTab === 'banner' ? (
                    /* Preview Banner */
                    <div className="space-y-3">
                      <div className="text-[11px] text-slate-400">
                        Así verán el banner fijado los usuarios en la cabecera de su portal:
                      </div>
                      <div
                        className={`p-4 rounded-xl border text-xs leading-relaxed shadow-xs ${
                          tipo === 'mantenimiento'
                            ? 'bg-amber-50 border-amber-300 text-amber-950'
                            : tipo === 'incidente'
                            ? 'bg-red-50 border-red-300 text-red-950'
                            : tipo === 'novedad'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-blue-50 border-blue-300 text-blue-950'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>{titulo || 'Título del anuncio aquí'}</span>
                        </div>
                        <p className="whitespace-pre-wrap">
                          {cuerpo || 'El contenido de tu mensaje aparecerá renderizado en este espacio.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Preview Correo */
                    <div className="space-y-3">
                      <div className="text-[11px] text-slate-400">
                        Así recibirán la notificación en su cliente de correo electrónico:
                      </div>
                      <div className="bg-white dark:bg-[#0E244D] rounded-xl border border-slate-200 dark:border-[#1A3668] p-4 text-xs shadow-xs space-y-3">
                        <div className="border-b border-slate-100 dark:border-[#1A3668] pb-2 text-[11px] text-slate-500">
                          <div>
                            <strong>De:</strong> Mesa de Ayuda SFS &lt;soporte@sfs.com.co&gt;
                          </div>
                          <div>
                            <strong>Asunto:</strong> [SFS Comunicado]{' '}
                            {titulo || 'Título del comunicado'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[#0B2A5B] dark:text-white font-bold text-sm">
                            Software Factory & Services - SFS
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">
                            {titulo || 'Título del comunicado'}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {cuerpo || 'Cuerpo del mensaje en el correo.'}
                          </p>
                          <div className="pt-3">
                            <span className="inline-block px-4 py-1.5 bg-[#1565C0] text-white text-[11px] font-bold rounded-lg">
                              Ingresar al Portal SFS
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
