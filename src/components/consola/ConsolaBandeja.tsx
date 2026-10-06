import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ticket,
  EstadoTicket,
  PrioridadTicket,
  CategoriaTicket,
} from '../../types';
import {
  formatoFechaHoraCO,
  tiempoRelativoCO,
  calcularEstadoSLA,
} from '../../lib/utils';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  UserPlus,
  Clock,
  AlertCircle,
  Building2,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from 'lucide-react';

const ESTADOS_KANBAN: { id: EstadoTicket; label: string; color: string }[] = [
  { id: 'nuevo', label: 'Nuevo', color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' },
  { id: 'asignado', label: 'Asignado', color: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20' },
  { id: 'en_progreso', label: 'En Progreso', color: 'border-[#3FA2E8] bg-sky-50/50 dark:bg-sky-950/20' },
  { id: 'en_espera_cliente', label: 'En Espera del Cliente', color: 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' },
  { id: 'resuelto', label: 'Resuelto', color: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' },
  { id: 'cerrado', label: 'Cerrado', color: 'border-slate-400 bg-slate-100/50 dark:bg-slate-900/30' },
];

export const ConsolaBandeja: React.FC = () => {
  const {
    tickets,
    empresas,
    usuarios,
    currentUser,
    navigate,
    asignarTicket,
    cambiarEstadoTicket,
    asignarEnLote,
    cambiarEstadoEnLote,
    currentPath,
  } = useApp();

  // URL search params simulator
  const queryParams = useMemo(() => {
    if (!currentPath.includes('?')) return {};
    const qs = currentPath.split('?')[1];
    return Object.fromEntries(new URLSearchParams(qs).entries());
  }, [currentPath]);

  // View mode: 'tabla' | 'kanban'
  const [viewMode, setViewMode] = useState<'tabla' | 'kanban'>('tabla');

  // Filters
  const [search, setSearch] = useState(queryParams.q || '');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroAgente, setFiltroAgente] = useState(
    queryParams.filtro === 'mis_tickets' && currentUser?.id ? currentUser.id : ''
  );
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSla, setFiltroSla] = useState('');
  const [soloSinAsignar, setSoloSinAsignar] = useState(queryParams.filtro === 'sin_asignar');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loteAgenteId, setLoteAgenteId] = useState('');
  const [loteEstado, setLoteEstado] = useState<EstadoTicket | ''>('');

  // Drag and drop state for Kanban
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchesNum = t.numero.toLowerCase().includes(q);
        const matchesAsunto = t.asunto.toLowerCase().includes(q);
        const matchesDesc = t.descripcion.toLowerCase().includes(q);
        if (!matchesNum && !matchesAsunto && !matchesDesc) return false;
      }

      // Quick tab filters
      if (soloSinAsignar && t.asignadoAId !== null) return false;
      if (queryParams.filtro === 'mis_tickets' && t.asignadoAId !== currentUser?.id) return false;

      // Select filters
      if (filtroEmpresa && t.empresaId !== filtroEmpresa) return false;
      if (filtroAgente && t.asignadoAId !== filtroAgente) return false;
      if (filtroPrioridad && t.prioridad !== filtroPrioridad) return false;
      if (filtroCategoria && t.categoria !== filtroCategoria) return false;

      // SLA filter
      if (filtroSla) {
        const slaInfo = calcularEstadoSLA(t.slaSolucionVence, t.resueltoEn);
        if (filtroSla === 'vencido' && slaInfo.estado !== 'vencido') return false;
        if (filtroSla === 'por_vencer' && slaInfo.estado !== 'por_vencer') return false;
        if (filtroSla === 'en_tiempo' && slaInfo.estado !== 'en_tiempo') return false;
      }

      return true;
    });
  }, [
    tickets,
    search,
    soloSinAsignar,
    queryParams.filtro,
    currentUser?.id,
    filtroEmpresa,
    filtroAgente,
    filtroPrioridad,
    filtroCategoria,
    filtroSla,
  ]);

  // Companies & Users maps
  const empresasMap = useMemo(() => {
    const map: Record<string, string> = {};
    empresas.forEach((e) => {
      map[e.id] = e.nombre;
    });
    return map;
  }, [empresas]);

  const usuariosMap = useMemo(() => {
    const map: Record<string, string> = {};
    usuarios.forEach((u) => {
      map[u.id] = `${u.nombre} ${u.apellidos}`;
    });
    return map;
  }, [usuarios]);

  const agentesList = useMemo(() => {
    return usuarios.filter((u) => u.rol === 'agente' || u.rol === 'supervisor');
  }, [usuarios]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTickets.map((t) => t.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleEjecutarLoteAsignar = () => {
    if (!loteAgenteId || selectedIds.length === 0) return;
    asignarEnLote(selectedIds, loteAgenteId);
    setSelectedIds([]);
    setLoteAgenteId('');
  };

  const handleEjecutarLoteEstado = () => {
    if (!loteEstado || selectedIds.length === 0) return;
    cambiarEstadoEnLote(selectedIds, loteEstado);
    setSelectedIds([]);
    setLoteEstado('');
  };

  // Drag and drop for Kanban
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingTicketId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDropOnColumn = (e: React.DragEvent, nuevoEstado: EstadoTicket) => {
    e.preventDefault();
    if (draggingTicketId) {
      cambiarEstadoTicket(draggingTicketId, nuevoEstado);
      setDraggingTicketId(null);
    }
  };

  const getPriorityBadge = (p: PrioridadTicket) => {
    switch (p) {
      case 'critica':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-xs bg-red-600 animate-pulse" />
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <span className="w-1.5 h-1.5 rounded-xs bg-orange-500" />
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-xs bg-blue-500" />
            Media
          </span>
        );
      case 'baja':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-xs bg-slate-400" />
            Baja
          </span>
        );
    }
  };

  const getEstadoBadge = (st: EstadoTicket) => {
    const config: Record<EstadoTicket, { label: string; class: string }> = {
      nuevo: {
        label: 'Nuevo',
        class: 'bg-blue-50 text-[#1565C0] border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
      },
      asignado: {
        label: 'Asignado',
        class: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900',
      },
      en_progreso: {
        label: 'En progreso',
        class: 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900',
      },
      en_espera_cliente: {
        label: 'Espera cliente',
        class: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 font-semibold',
      },
      resuelto: {
        label: 'Resuelto',
        class: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900 font-medium',
      },
      cerrado: {
        label: 'Cerrado',
        class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
      },
    };
    const c = config[st];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border ${c.class}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0B2A5B] dark:text-white tracking-tight flex items-center gap-2">
            <span>Bandeja de Tickets</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300 font-semibold">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'caso' : 'casos'}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cola de atención técnica en tiempo real con monitoreo de SLA Colombia
          </p>
        </div>

        {/* View toggle & refresh */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('tabla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'tabla'
                  ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] dark:text-[#3FA2E8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#0E244D] text-[#1565C0] dark:text-[#3FA2E8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0E244D] p-3.5 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar #ticket o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Empresa filter */}
          <div>
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
            >
              <option value="">Todas las Empresas</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre.length > 25 ? emp.nombre.slice(0, 25) + '...' : emp.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Agente filter */}
          <div>
            <select
              value={filtroAgente}
              onChange={(e) => {
                setFiltroAgente(e.target.value);
                setSoloSinAsignar(false);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
            >
              <option value="">Todos los Agentes</option>
              {agentesList.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.nombre} {ag.apellidos}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad filter */}
          <div>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
            >
              <option value="">Todas las Prioridades</option>
              <option value="critica">Crítica (1h / 4h)</option>
              <option value="alta">Alta (4h / 24h)</option>
              <option value="media">Media (8h / 72h)</option>
              <option value="baja">Baja (24h / 120h)</option>
            </select>
          </div>

          {/* SLA filter */}
          <div>
            <select
              value={filtroSla}
              onChange={(e) => setFiltroSla(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-lg focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
            >
              <option value="">Estado SLA (Todos)</option>
              <option value="vencido">⚠️ SLA Vencido</option>
              <option value="por_vencer">⏳ SLA Por Vencer (&lt;2h)</option>
              <option value="en_tiempo">✅ SLA En Tiempo</option>
            </select>
          </div>
        </div>

        {/* Quick segmented filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#1A3668] text-xs">
          <span className="text-slate-400 font-semibold tracking-wide text-[11px] uppercase">Filtros rápidos:</span>
          <button
            onClick={() => {
              setSoloSinAsignar(!soloSinAsignar);
              setFiltroAgente('');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              soloSinAsignar
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Sin Asignar <span className="font-mono tabular-nums ml-1">({tickets.filter((t) => !t.asignadoAId && t.estado !== 'cerrado' && t.estado !== 'resuelto').length})</span>
          </button>

          <button
            onClick={() => {
              if (currentUser?.id) {
                setFiltroAgente(filtroAgente === currentUser.id ? '' : currentUser.id);
                setSoloSinAsignar(false);
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filtroAgente === currentUser?.id
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Mis Asignados
          </button>

          <button
            onClick={() => setFiltroSla(filtroSla === 'vencido' ? '' : 'vencido')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filtroSla === 'vencido'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
            }`}
          >
            SLA Vencido
          </button>

          {(search || filtroEmpresa || filtroAgente || filtroPrioridad || filtroSla || soloSinAsignar) && (
            <button
              onClick={() => {
                setSearch('');
                setFiltroEmpresa('');
                setFiltroAgente('');
                setFiltroPrioridad('');
                setFiltroCategoria('');
                setFiltroSla('');
                setSoloSinAsignar(false);
              }}
              className="text-xs text-[#1565C0] dark:text-[#3FA2E8] hover:underline ml-auto flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Actions Toolbar (Appears when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#0B2A5B] text-white p-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-6 h-6 rounded-full bg-[#F37021] text-white flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span>tickets seleccionados para acción masiva</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Assign */}
            <div className="flex items-center gap-1">
              <select
                value={loteAgenteId}
                onChange={(e) => setLoteAgenteId(e.target.value)}
                className="px-2.5 py-1 text-xs bg-[#153B75] text-white border border-[#1A4585] rounded-lg focus:outline-none"
              >
                <option value="">Seleccionar agente...</option>
                {agentesList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellidos}
                  </option>
                ))}
              </select>
              <button
                disabled={!loteAgenteId}
                onClick={handleEjecutarLoteAsignar}
                className="px-3 py-1 bg-[#1565C0] hover:bg-[#1976D2] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
              >
                Asignar en lote
              </button>
            </div>

            {/* Batch Status */}
            <div className="flex items-center gap-1">
              <select
                value={loteEstado}
                onChange={(e) => setLoteEstado(e.target.value as EstadoTicket)}
                className="px-2.5 py-1 text-xs bg-[#153B75] text-white border border-[#1A4585] rounded-lg focus:outline-none"
              >
                <option value="">Cambiar estado a...</option>
                <option value="asignado">Asignado</option>
                <option value="en_progreso">En progreso</option>
                <option value="en_espera_cliente">En espera del cliente</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
              <button
                disabled={!loteEstado}
                onClick={handleEjecutarLoteEstado}
                className="px-3 py-1 bg-[#F37021] hover:bg-[#ff7e33] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
              >
                Actualizar estado
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-300 hover:text-white px-2 py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Table or Kanban */}
      {viewMode === 'tabla' ? (
        <div className="bg-white dark:bg-[#0E244D] rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-[#081B3A] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-[#1A3668]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Seleccionar todos"
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredTickets.length ? (
                        <CheckSquare className="w-4 h-4 text-[#1565C0] dark:text-[#3FA2E8]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 w-28">Número</th>
                  <th className="p-3 min-w-[240px]">Asunto & Módulo</th>
                  <th className="p-3 min-w-[180px]">Empresa</th>
                  <th className="p-3 w-24">Prioridad</th>
                  <th className="p-3 w-28">Estado</th>
                  <th className="p-3 w-32">Reloj SLA</th>
                  <th className="p-3 w-36">Asignado A</th>
                  <th className="p-3 w-28">Actualizado</th>
                  <th className="p-3 w-12 text-center">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1A3668]">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          No se encontraron tickets
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Ajusta los filtros o la búsqueda para encontrar casos de soporte.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const isSelected = selectedIds.includes(t.id);
                    const slaInfo = calcularEstadoSLA(t.slaSolucionVence, t.resueltoEn);
                    const empresaNombre = empresasMap[t.empresaId] || 'Empresa';
                    const agenteNombre = t.asignadoAId ? usuariosMap[t.asignadoAId] : null;

                    return (
                      <tr
                        key={t.id}
                        className={`transition hover:bg-blue-50/40 dark:hover:bg-blue-950/30 ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/60' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleSelectOne(t.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#1565C0] dark:text-[#3FA2E8]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Number */}
                        <td className="p-3 font-mono font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                          <button
                            onClick={() => navigate(`/consola/ticket/${t.id}`)}
                            className="hover:underline text-left"
                          >
                            {t.numero}
                          </button>
                        </td>

                        {/* Subject & Module */}
                        <td className="p-3">
                          <div
                            onClick={() => navigate(`/consola/ticket/${t.id}`)}
                            className="cursor-pointer group"
                          >
                            <div className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#1565C0] dark:group-hover:text-[#3FA2E8] transition line-clamp-1">
                              {t.asunto}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span className="font-medium text-slate-500 dark:text-slate-400">
                                {t.modulo}
                              </span>
                              <span>•</span>
                              <span>{t.etiquetas.slice(0, 2).join(', ')}</span>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[170px]" title={empresaNombre}>
                              {empresaNombre}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="p-3">{getPriorityBadge(t.prioridad)}</td>

                        {/* Status */}
                        <td className="p-3">{getEstadoBadge(t.estado)}</td>

                        {/* SLA Clock */}
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 text-[10px] rounded-md border ${slaInfo.badgeClase}`}>
                              {slaInfo.tiempoRestanteTexto}
                            </span>
                          </div>
                        </td>

                        {/* Assigned to */}
                        <td className="p-3">
                          {agenteNombre ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center text-[10px] font-bold">
                                {agenteNombre.split(' ')[0][0]}
                                {agenteNombre.split(' ')[1]?.[0] || ''}
                              </div>
                              <span className="truncate max-w-[100px] text-xs font-medium">
                                {agenteNombre.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => currentUser && asignarTicket(t.id, currentUser.id)}
                              className="px-2 py-0.5 text-[10px] font-semibold text-[#1565C0] hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-md border border-blue-200 dark:border-blue-800 transition flex items-center gap-1"
                              title="Asignarme este caso de inmediato"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Tomar</span>
                            </button>
                          )}
                        </td>

                        {/* Updated */}
                        <td className="p-3 text-[11px] text-slate-400">
                          {tiempoRelativoCO(t.actualizadoEn)}
                        </td>

                        {/* Open Arrow */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => navigate(`/consola/ticket/${t.id}`)}
                            className="p-1 text-slate-400 hover:text-[#1565C0] dark:hover:text-[#3FA2E8] transition"
                            aria-label="Abrir ticket"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {ESTADOS_KANBAN.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.estado === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`flex flex-col rounded-xl border border-slate-200 dark:border-[#1A3668] bg-white dark:bg-[#0E244D] p-3 min-h-[500px] shadow-2xs transition-colors ${
                  draggingTicketId ? 'hover:border-[#1565C0]' : ''
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-[#1A3668]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center">
                      {colTickets.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                  {colTickets.map((t) => {
                    const slaInfo = calcularEstadoSLA(t.slaSolucionVence, t.resueltoEn);
                    const empNombre = empresasMap[t.empresaId] || 'Empresa';
                    const agente = t.asignadoAId ? usuariosMap[t.asignadoAId] : null;

                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => navigate(`/consola/ticket/${t.id}`)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#1A3668] bg-slate-50/70 dark:bg-[#081B3A]/80 hover:border-[#1565C0] dark:hover:border-[#3FA2E8] shadow-xs cursor-pointer transition group"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#1565C0] dark:text-[#3FA2E8]">
                            {t.numero}
                          </span>
                          {getPriorityBadge(t.prioridad)}
                        </div>

                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#1565C0] dark:group-hover:text-[#3FA2E8] line-clamp-2 leading-snug mb-2">
                          {t.asunto}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{empNombre}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-[#1A3668]/60 flex items-center justify-between text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-medium border ${slaInfo.badgeClase}`}>
                            {slaInfo.tiempoRestanteTexto}
                          </span>

                          {agente ? (
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {agente.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-amber-500 font-semibold">Sin asignar</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTickets.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400 text-center p-2">
                      Arrastra tickets aquí
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
