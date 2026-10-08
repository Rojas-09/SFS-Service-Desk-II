import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReglaSLA, MacroRespuesta, PrioridadTicket } from '../../types';
import {
  Settings,
  Clock,
  Zap,
  Save,
  PlusCircle,
  Trash2,
  Calendar,
  ShieldCheck,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { enviarNotificacionPorCorreo } from '../../lib/notificaciones';

export const ConsolaConfiguracion: React.FC = () => {
  const {
    reglasSla,
    guardarReglasSla,
    macros,
    guardarMacros,
    config,
    guardarConfiguracion,
    correosSimulados,
    abrirNotificaciones,
    currentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sla' | 'macros' | 'horario' | 'notificaciones'>('sla');
  const [enviandoPrueba, setEnviandoPrueba] = useState(false);

  // SLA state
  const [localSla, setLocalSla] = useState<ReglaSLA[]>(reglasSla);

  // Macros state
  const [localMacros, setLocalMacros] = useState<MacroRespuesta[]>(macros);
  const [nuevoMacroTitulo, setNuevoMacroTitulo] = useState('');
  const [nuevoMacroAtajo, setNuevoMacroAtajo] = useState('');
  const [nuevoMacroTexto, setNuevoMacroTexto] = useState('');

  // Horario state
  const [horaInicio, setHoraInicio] = useState(config.horarioHabilInicio);
  const [horaFin, setHoraFin] = useState(config.horarioHabilFin);
  const [reglaAsignacion, setReglaAsignacion] = useState(config.reglaAsignacion);

  const handleUpdateSla = (prio: PrioridadTicket, campo: 'primeraRespuestaHoras' | 'solucionHoras', val: number) => {
    setLocalSla((prev) =>
      prev.map((r) => (r.prioridad === prio ? { ...r, [campo]: Number(val) } : r))
    );
  };

  const handleSaveSla = () => {
    guardarReglasSla(localSla);
  };

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMacroTitulo.trim() || !nuevoMacroTexto.trim()) return;

    const atajoClean = nuevoMacroAtajo.startsWith('/')
      ? nuevoMacroAtajo.trim()
      : `/${nuevoMacroAtajo.trim()}`;

    const nuevaMacro: MacroRespuesta = {
      id: `mac-${Date.now()}`,
      titulo: nuevoMacroTitulo.trim(),
      atajo: atajoClean,
      categoria: 'general',
      contenido: nuevoMacroTexto.trim(),
    };

    const updated = [...localMacros, nuevaMacro];
    setLocalMacros(updated);
    guardarMacros(updated);

    setNuevoMacroTitulo('');
    setNuevoMacroAtajo('');
    setNuevoMacroTexto('');
  };

  const handleDeleteMacro = (id: string) => {
    const updated = localMacros.filter((m) => m.id !== id);
    setLocalMacros(updated);
    guardarMacros(updated);
  };

  const handleSaveConfig = () => {
    guardarConfiguracion({
      ...config,
      horarioHabilInicio: horaInicio,
      horarioHabilFin: horaFin,
      reglaAsignacion,
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#1565C0] dark:text-[#3FA2E8] shrink-0">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0B2A5B] dark:text-white tracking-tight break-words">
              Configuración de Mesa de Ayuda SFS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Políticas de SLA Colombia, asignación automática, respuestas predefinidas y ventanas horarias
          </p>
        </div>
      </div>

      {/* Tabs navigation (Responsive, comfortable touch targets, no horizontal cut) */}
      <div className="flex border-b border-slate-200 dark:border-[#1A3668] gap-2 text-xs font-bold overflow-x-auto pb-1.5 scrollbar-thin px-1 -mx-1 sm:mx-0">
        <button
          onClick={() => setActiveTab('sla')}
          className={`py-2 sm:py-2.5 px-3.5 sm:px-4 border-b-2 transition flex items-center gap-2 shrink-0 rounded-t-xl text-xs sm:text-xs whitespace-nowrap min-h-[42px] ${
            activeTab === 'sla'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] bg-blue-50/60 dark:bg-blue-950/40 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Reglas de SLA por Prioridad</span>
        </button>

        <button
          onClick={() => setActiveTab('macros')}
          className={`py-2 sm:py-2.5 px-3.5 sm:px-4 border-b-2 transition flex items-center gap-2 shrink-0 rounded-t-xl text-xs sm:text-xs whitespace-nowrap min-h-[42px] ${
            activeTab === 'macros'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] bg-blue-50/60 dark:bg-blue-950/40 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>Respuestas Predefinidas (Macros)</span>
        </button>

        <button
          onClick={() => setActiveTab('horario')}
          className={`py-2 sm:py-2.5 px-3.5 sm:px-4 border-b-2 transition flex items-center gap-2 shrink-0 rounded-t-xl text-xs sm:text-xs whitespace-nowrap min-h-[42px] ${
            activeTab === 'horario'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] bg-blue-50/60 dark:bg-blue-950/40 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Horario Hábil & Asignación</span>
        </button>

        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`py-2 sm:py-2.5 px-3.5 sm:px-4 border-b-2 transition flex items-center gap-2 shrink-0 rounded-t-xl text-xs sm:text-xs whitespace-nowrap min-h-[42px] ${
            activeTab === 'notificaciones'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8] bg-blue-50/60 dark:bg-blue-950/40 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span>Notificaciones & Correo</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
            {correosSimulados.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SLA */}
      {activeTab === 'sla' && (
        <div className="bg-white dark:bg-[#0E244D] p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1A3668]/60">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#0B2A5B] dark:text-white">
                Tiempos de Atención y Solución en Horario Hábil Colombia
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Definidos según los contratos de soporte y acuerdos de nivel de servicio
              </p>
            </div>
            <button
              onClick={handleSaveSla}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#1565C0] hover:bg-[#1976D2] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs shrink-0 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Tiempos SLA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pt-1">
            {localSla.map((regla) => (
              <div
                key={regla.prioridad}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#1A3668] bg-slate-50/60 dark:bg-[#081B3A]/40 space-y-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        regla.prioridad === 'critica'
                          ? 'bg-rose-600 animate-pulse'
                          : regla.prioridad === 'alta'
                          ? 'bg-[#F37021]'
                          : regla.prioridad === 'media'
                          ? 'bg-blue-600'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Prioridad {regla.prioridad}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0E244D] px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-[#1A3668]">
                    {regla.nombre}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {regla.descripcion}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      1ra Respuesta (Horas)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={regla.primeraRespuestaHoras}
                      onChange={(e) =>
                        handleUpdateSla(
                          regla.prioridad,
                          'primeraRespuestaHoras',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Solución Definitiva (Horas)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={regla.solucionHoras}
                      onChange={(e) =>
                        handleUpdateSla(
                          regla.prioridad,
                          'solucionHoras',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MACROS */}
      {activeTab === 'macros' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* List of existing macros */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0E244D] p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1A3668]/60">
              <h2 className="text-sm sm:text-base font-bold text-[#0B2A5B] dark:text-white">
                Plantillas de Respuesta Rápida ({localMacros.length})
              </h2>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Atajos con "/"
              </span>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {localMacros.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1A3668] bg-slate-50/60 dark:bg-[#081B3A]/40 text-xs space-y-2 hover:border-slate-300 dark:hover:border-blue-900 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-bold text-[#1565C0] dark:text-[#3FA2E8] truncate">
                        {m.titulo}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 font-mono text-[11px] font-bold text-[#1565C0] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
                        {m.atajo}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteMacro(m.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition shrink-0"
                      title="Eliminar macro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-xs">
                    {m.contenido}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add new macro form */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0E244D] p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-[#0B2A5B] dark:text-white pb-2 border-b border-slate-100 dark:border-[#1A3668]/60">
              Crear Nueva Respuesta Rápida
            </h2>
            <form onSubmit={handleAddMacro} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Título de la Plantilla
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Validación de Báscula Serial"
                  value={nuevoMacroTitulo}
                  onChange={(e) => setNuevoMacroTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Atajo de Teclado (Comienza con /)
                </label>
                <input
                  type="text"
                  required
                  placeholder="/bascula-puerto"
                  value={nuevoMacroAtajo}
                  onChange={(e) => setNuevoMacroAtajo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Contenido de la Respuesta (Variables: {'{cliente}'}, {'{ticket}'})
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Estimado {cliente}, hemos verificado los puertos de la báscula..."
                  value={nuevoMacroTexto}
                  onChange={(e) => setNuevoMacroTexto(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#F37021] hover:bg-[#e06114] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Agregar Macro</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: HORARIOS & REGLAS */}
      {activeTab === 'horario' && (
        <div className="bg-white dark:bg-[#0E244D] p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-[#1A3668]/60">
            <h2 className="text-sm sm:text-base font-bold text-[#0B2A5B] dark:text-white">
              Jornada Hábil de Soporte en Colombia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Los cronómetros de SLA pausan automáticamente fuera de esta franja y fines de semana
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-[#1A3668] bg-slate-50/50 dark:bg-[#081B3A]/40 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Hora de Inicio (Lunes a Viernes)
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none font-mono font-semibold"
              />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-[#1A3668] bg-slate-50/50 dark:bg-[#081B3A]/40 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none font-mono font-semibold"
              />
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-[#1A3668] bg-slate-50/50 dark:bg-[#081B3A]/40 space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Regla de Asignación Automática
              </label>
              <select
                value={reglaAsignacion}
                onChange={(e) => setReglaAsignacion(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none font-semibold text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="round_robin">Turnos Rotativos (Round-Robin)</option>
                <option value="por_categoria">Por Especialidad de Módulo</option>
                <option value="manual">Manual por Supervisor</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-xs space-y-2">
            <div className="font-bold text-[#0B2A5B] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
              <span>Calendario de Festivos de Colombia Activo (Ley Emiliani)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs pl-7">
              El motor de SLA descuenta automáticamente los días feriados oficiales de la República de Colombia para el cómputo exacto de los plazos contractuales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end pt-2">
            <button
              onClick={handleSaveConfig}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1565C0] hover:bg-[#1976D2] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros de Operación</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICACIONES & CORREO SIMULADO */}
      {activeTab === 'notificaciones' && (
        <div className="bg-white dark:bg-[#0E244D] p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1A3668]/60">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1565C0] dark:text-[#3FA2E8]" />
                <span>Servicio Simulado de Notificaciones & SMTP (SFS Mailer)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Emite correos institucionales simulados y alertas in-app automáticas en cada etapa del ticket y comunicados
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Servicio Operativo
              </span>
            </div>
          </div>

          {/* Tarjetas de Estado y Métricas del Servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] space-y-1">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Pasarela Activa</span>
              <div className="font-extrabold text-sm text-[#0B2A5B] dark:text-white">Simulador SMTP Local</div>
              <p className="text-slate-500 text-[11px]">Latencia estimada: 80ms • Persistencia en memoria y local</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] space-y-1">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Zona Horaria Oficial</span>
              <div className="font-extrabold text-sm text-[#0B2A5B] dark:text-white">America/Bogota (COT)</div>
              <p className="text-slate-500 text-[11px]">Formato legal colombiano en todas las cabeceras</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] space-y-1">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Correos en Salida</span>
              <div className="font-extrabold text-sm text-[#1565C0] dark:text-[#3FA2E8]">
                {correosSimulados.length} Mensajes Registrados
              </div>
              <p className="text-slate-500 text-[11px]">Disponibles para previsualización HTML interactiva</p>
            </div>
          </div>

          {/* Eventos Automatizados Cubiertos */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Eventos Automáticos con Notificación Dual (In-App + Email Simulado)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-blue-100 dark:border-[#1A3668] bg-blue-50/40 dark:bg-[#081B3A]/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-[#1565C0] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B2A5B] dark:text-white">Radicación de Ticket</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Confirma el número de caso al cliente y envía alerta prioritaria a los supervisores de soporte.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-100 dark:border-[#1A3668] bg-purple-50/40 dark:bg-[#081B3A]/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B2A5B] dark:text-white">Asignación de Especialista</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Notifica al agente con los datos del caso, prioridad y tiempo de primera respuesta restante.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-100 dark:border-[#1A3668] bg-sky-50/40 dark:bg-[#081B3A]/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B2A5B] dark:text-white">Respuestas en Conversación</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Envía el extracto del mensaje al cliente o especialista (las notas internas se mantienen 100% confidenciales).
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-[#1A3668] bg-emerald-50/40 dark:bg-[#081B3A]/40 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B2A5B] dark:text-white">Solución de Ticket & Encuesta CSAT</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Invita al cliente a calificar el servicio de 1 a 5 estrellas con botón directo al portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consola de Pruebas en Vivo */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="font-bold text-[#0B2A5B] dark:text-white text-xs sm:text-sm">
                Probar Despacho de Correo Simulado
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
                Envía un correo de prueba inmediato para verificar la plantilla corporativa SFS y la bandeja de salida.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                disabled={enviandoPrueba}
                onClick={async () => {
                  setEnviandoPrueba(true);
                  try {
                    const destinatario = currentUser?.email || 'admin@sfs.com.co';
                    const nombre = currentUser ? `${currentUser.nombre} ${currentUser.apellidos}` : 'Administrador SFS';
                    await enviarNotificacionPorCorreo({
                      to: destinatario,
                      toName: nombre,
                      subject: `[SFS Service Desk] Prueba de Pasarela de Correo • ${new Date().toLocaleTimeString('es-CO')}`,
                      bodyText: 'Este es un mensaje de prueba emitido desde la Consola de Configuración de la Mesa de Ayuda SFS.',
                      evento: 'ticket_nuevo',
                    });
                    showToast('Correo de prueba despachado con éxito', 'exito');
                  } catch (e) {
                    showToast('Error al simular envío', 'error');
                  } finally {
                    setEnviandoPrueba(false);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#1565C0] hover:bg-[#1976D2] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 min-h-[40px] active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{enviandoPrueba ? 'Despachando...' : 'Enviar Prueba SMTP'}</span>
              </button>

              <button
                type="button"
                onClick={abrirNotificaciones}
                className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-[#1A3668] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 min-h-[40px] active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Bandeja de Salida</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
