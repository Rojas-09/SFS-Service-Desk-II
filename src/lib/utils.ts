export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatoFechaHoraCO(fechaIso: string | Date | undefined): string {
  if (!fechaIso) return '—';
  try {
    const d = typeof fechaIso === 'string' ? new Date(fechaIso) : fechaIso;
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return '—';
  }
}

export function formatoFechaCortaCO(fechaIso: string | Date | undefined): string {
  if (!fechaIso) return '—';
  try {
    const d = typeof fechaIso === 'string' ? new Date(fechaIso) : fechaIso;
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return '—';
  }
}

export function tiempoRelativoCO(fechaIso: string | Date | undefined): string {
  if (!fechaIso) return '—';
  try {
    const d = typeof fechaIso === 'string' ? new Date(fechaIso) : fechaIso;
    const ahora = new Date();
    const diffMs = ahora.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 3600));
    const diffDias = Math.floor(diffMs / (1000 * 3600 * 24));

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 30) return `Hace ${diffDias} días`;
    const diffMeses = Math.floor(diffDias / 30);
    return `Hace ${diffMeses} ${diffMeses === 1 ? 'mes' : 'meses'}`;
  } catch (e) {
    return '—';
  }
}

export interface EstadoSLAInfo {
  estado: 'en_tiempo' | 'por_vencer' | 'vencido' | 'cumplido';
  etiqueta: string;
  tiempoRestanteTexto: string;
  colorClase: string;
  badgeClase: string;
  minutosRestantes: number;
}

export function calcularEstadoSLA(
  fechaLimiteIso: string,
  fechaCumplimientoIso?: string
): EstadoSLAInfo {
  const limite = new Date(fechaLimiteIso).getTime();
  
  if (fechaCumplimientoIso) {
    const cumplimiento = new Date(fechaCumplimientoIso).getTime();
    if (cumplimiento <= limite) {
      return {
        estado: 'cumplido',
        etiqueta: 'Cumplido a tiempo',
        tiempoRestanteTexto: 'Completado',
        colorClase: 'text-emerald-600 dark:text-emerald-400',
        badgeClase: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        minutosRestantes: 0,
      };
    } else {
      const retrasoMins = Math.round((cumplimiento - limite) / (1000 * 60));
      return {
        estado: 'vencido',
        etiqueta: 'Cumplido fuera de SLA',
        tiempoRestanteTexto: `+${Math.floor(retrasoMins / 60)}h ${retrasoMins % 60}m tarde`,
        colorClase: 'text-red-600 dark:text-red-400',
        badgeClase: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
        minutosRestantes: -retrasoMins,
      };
    }
  }

  const ahora = Date.now();
  const diffMs = limite - ahora;
  const minutosRestantes = Math.round(diffMs / (1000 * 60));

  if (diffMs <= 0) {
    const atrasoMins = Math.abs(minutosRestantes);
    const horas = Math.floor(atrasoMins / 60);
    const mins = atrasoMins % 60;
    return {
      estado: 'vencido',
      etiqueta: 'SLA Vencido',
      tiempoRestanteTexto: `Vencido hace ${horas > 0 ? `${horas}h ` : ''}${mins}m`,
      colorClase: 'text-red-600 dark:text-red-400 font-semibold',
      badgeClase: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/60 dark:text-red-200 dark:border-red-700 font-semibold animate-pulse',
      minutosRestantes,
    };
  }

  if (minutosRestantes <= 120) {
    const horas = Math.floor(minutosRestantes / 60);
    const mins = minutosRestantes % 60;
    return {
      estado: 'por_vencer',
      etiqueta: 'Por vencer',
      tiempoRestanteTexto: `Quedan ${horas > 0 ? `${horas}h ` : ''}${mins}m`,
      colorClase: 'text-amber-600 dark:text-amber-400 font-semibold',
      badgeClase: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700',
      minutosRestantes,
    };
  }

  const horas = Math.floor(minutosRestantes / 60);
  const dias = Math.floor(horas / 24);
  const texto = dias > 0 ? `${dias}d ${horas % 24}h restantes` : `${horas}h restantes`;

  return {
    estado: 'en_tiempo',
    etiqueta: 'En tiempo',
    tiempoRestanteTexto: texto,
    colorClase: 'text-blue-600 dark:text-blue-400',
    badgeClase: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    minutosRestantes,
  };
}

export function exportarTicketsACSV(tickets: any[], empresasMap: Record<string, string>, usuariosMap: Record<string, string>): void {
  const headers = [
    'Número',
    'Asunto',
    'Empresa',
    'Estado',
    'Prioridad',
    'Categoría',
    'Módulo',
    'Solicitante',
    'Asignado A',
    'Fecha Creación',
    'SLA Solución Vence',
    'Fecha Resuelto',
    'SLA Cumplido',
    'Calificación CSAT',
  ];

  const filas = tickets.map((t) => [
    t.numero,
    `"${(t.asunto || '').replace(/"/g, '""')}"`,
    `"${(empresasMap[t.empresaId] || t.empresaId).replace(/"/g, '""')}"`,
    t.estado,
    t.prioridad,
    t.categoria,
    `"${(t.modulo || '').replace(/"/g, '""')}"`,
    `"${(usuariosMap[t.creadoPorId] || t.creadoPorId).replace(/"/g, '""')}"`,
    `"${(t.asignadoAId ? usuariosMap[t.asignadoAId] || t.asignadoAId : 'Sin asignar').replace(/"/g, '""')}"`,
    formatoFechaHoraCO(t.creadoEn),
    formatoFechaHoraCO(t.slaSolucionVence),
    t.resueltoEn ? formatoFechaHoraCO(t.resueltoEn) : 'Pendiente',
    t.slaSolucionCumplido === undefined ? 'En proceso' : t.slaSolucionCumplido ? 'Sí' : 'No',
    t.calificacion?.estrellas ? `${t.calificacion.estrellas} / 5` : 'Sin calificar',
  ]);

  const csvContent = [headers.join(';'), ...filas.map((f) => f.join(';'))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SFS_Service_Desk_Reporte_Tickets_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
