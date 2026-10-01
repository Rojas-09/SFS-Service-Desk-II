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
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ConsolaConfiguracion: React.FC = () => {
  const {
    reglasSla,
    guardarReglasSla,
    macros,
    guardarMacros,
    config,
    guardarConfiguracion,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sla' | 'macros' | 'horario' | 'correo'>('sla');

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0B2A5B] dark:text-white tracking-tight flex items-center gap-2">
            <span>Configuración de Mesa de Ayuda SFS</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Políticas de SLA Colombia, asignación automática, respuestas predefinidas y ventanas horarias
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-[#1A3668] gap-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('sla')}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'sla'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Reglas de SLA por Prioridad</span>
        </button>

        <button
          onClick={() => setActiveTab('macros')}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'macros'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Respuestas Predefinidas (Macros)</span>
        </button>

        <button
          onClick={() => setActiveTab('horario')}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'horario'
              ? 'border-[#1565C0] text-[#1565C0] dark:text-[#3FA2E8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horario Hábil & Asignación</span>
        </button>
      </div>

      {/* TAB 1: SLA */}
      {activeTab === 'sla' && (
        <div className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0B2A5B] dark:text-white">
                Tiempos de Atención y Solución en Horario Hábil Colombia
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Definidos según los contratos de soporte y acuerdos de nivel de servicio
              </p>
            </div>
            <button
              onClick={handleSaveSla}
              className="px-4 py-2 bg-[#1565C0] hover:bg-[#1976D2] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Tiempos SLA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {localSla.map((regla) => (
              <div
                key={regla.prioridad}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] bg-slate-50/50 dark:bg-[#081B3A]/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                      regla.prioridad === 'critica'
                        ? 'bg-red-100 text-red-700'
                        : regla.prioridad === 'alta'
                        ? 'bg-orange-100 text-[#F37021]'
                        : regla.prioridad === 'media'
                        ? 'bg-blue-100 text-[#1565C0]'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {regla.prioridad}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {regla.nombre}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {regla.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
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
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
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
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* List of existing macros */}
          <div className="md:col-span-7 bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[#0B2A5B] dark:text-white">
              Plantillas de Respuesta Rápida Activas ({localMacros.length})
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {localMacros.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-[#1A3668] bg-slate-50/60 dark:bg-[#081B3A]/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                        {m.titulo}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 font-mono text-[10px] text-[#1565C0] dark:text-blue-300">
                        {m.atajo}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteMacro(m.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Eliminar macro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {m.contenido}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add new macro form */}
          <div className="md:col-span-5 bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-[#0B2A5B] dark:text-white">
              Crear Nueva Respuesta Rápida
            </h2>
            <form onSubmit={handleAddMacro} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Validación de Báscula Serial"
                  value={nuevoMacroTitulo}
                  onChange={(e) => setNuevoMacroTitulo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Atajo de Teclado
                </label>
                <input
                  type="text"
                  required
                  placeholder="/bascula-puerto"
                  value={nuevoMacroAtajo}
                  onChange={(e) => setNuevoMacroAtajo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Contenido (Variables: {'{cliente}'}, {'{ticket}'})
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Estimado {cliente}, hemos verificado los puertos de la báscula..."
                  value={nuevoMacroTexto}
                  onChange={(e) => setNuevoMacroTexto(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#F37021] hover:bg-[#e06114] text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Agregar Macro</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: HORARIOS & REGLAS */}
      {activeTab === 'horario' && (
        <div className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#0B2A5B] dark:text-white">
              Jornada Hábil de Soporte en Colombia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Los cronómetros de SLA pausan automáticamente fuera de esta franja y fines de semana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Hora de Inicio (Lunes a Viernes)
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Regla de Asignación Automática
              </label>
              <select
                value={reglaAsignacion}
                onChange={(e) => setReglaAsignacion(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
              >
                <option value="round_robin">Turnos Rotativos (Round-Robin)</option>
                <option value="por_categoria">Por Especialidad de Módulo</option>
                <option value="manual">Manual por Supervisor</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] text-xs space-y-2">
            <div className="font-bold text-[#0B2A5B] dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Calendario de Festivos de Colombia Activo (Ley Emiliani)</span>
            </div>
            <p className="text-slate-500">
              El motor de SLA descuenta automáticamente los días feriados oficiales de la República de Colombia para el cómputo exacto de los plazos contractuales.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 bg-[#1565C0] hover:bg-[#1976D2] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Parámetros de Operación</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
