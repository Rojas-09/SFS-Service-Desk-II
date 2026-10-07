import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatoFechaHoraCO } from './utils';

export interface ParametrosReportePDF {
  tickets: any[];
  empresasMap: Record<string, string>;
  usuariosMap: Record<string, string>;
  rangoDias: number;
  empresaFiltroId?: string;
  nombreEmpresaFiltro?: string;
  metricas: {
    totalCasos: number;
    totalAbiertos: number;
    totalResueltos: number;
    promedioPrimeraRespH: number;
    promedioSolucionH: number;
    porcentajeSLA: number;
    csatPromedio: number;
  };
}

export function exportarMetricasAPDF(params: ParametrosReportePDF): void {
  const {
    tickets,
    empresasMap,
    usuariosMap,
    rangoDias,
    nombreEmpresaFiltro,
    metricas,
  } = params;

  // Initialize document in portrait A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // Brand Colors
  const marineBlue = [11, 42, 91] as [number, number, number]; // #0B2A5B
  const sfsBlue = [21, 101, 192] as [number, number, number];   // #1565C0
  const orange = [243, 112, 33] as [number, number, number];    // #F37021
  const emerald = [22, 163, 74] as [number, number, number];    // #16A34A
  const textDark = [15, 23, 42] as [number, number, number];    // #0F172A
  const textMuted = [100, 116, 139] as [number, number, number]; // #64748B
  const bgLight = [248, 250, 252] as [number, number, number];  // #F8FAFC
  const borderLight = [226, 232, 240] as [number, number, number];

  // 1. Top Decorative Bar
  doc.setFillColor(...marineBlue);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(...orange);
  doc.rect(pageWidth - 45, 0, 45, 5, 'F');

  let currentY = 14;

  // 2. Company Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...marineBlue);
  doc.text('SOFTWARE FACTORY AND SERVICES (SFS)', marginX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...orange);
  doc.text('MESA DE AYUDA & SOPORTE TÉCNICO ERP', marginX, currentY + 4.5);

  // Top right date & info
  const fechaGeneracion = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`Fecha de Emisión: ${fechaGeneracion}`, pageWidth - marginX, currentY, { align: 'right' });
  doc.text('Zona Horaria: Colombia (COT, GMT-5)', pageWidth - marginX, currentY + 4.5, { align: 'right' });

  currentY += 12;

  // Horizontal divider
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 8;

  // 3. Document Title & Period Banner
  doc.setFillColor(...bgLight);
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 18, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...marineBlue);
  doc.text('INFORME MENSUAL DE DESEMPEÑO Y CUMPLIMIENTO SLA', marginX + 4, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const periodoTexto = `Período Analizado: Últimos ${rangoDias} días · Alcance: ${
    nombreEmpresaFiltro ? `Empresa ${nombreEmpresaFiltro}` : 'Todas las Organizaciones Clientes'
  }`;
  doc.text(periodoTexto, marginX + 4, currentY + 12.5);

  currentY += 24;

  // 4. Executive Summary KPI Grid (Tabular Cards)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...marineBlue);
  doc.text('1. RESUMEN EJECUTIVO DE GESTIÓN Y NIVELES DE SERVICIO', marginX, currentY);

  currentY += 4;

  const cardWidth = (pageWidth - marginX * 2 - 10) / 3; // 3 columns
  const cardHeight = 16;

  const kpisFila1 = [
    { label: 'Casos Totales Registrados', value: `${metricas.totalCasos}`, sub: 'Volumen en período', color: sfsBlue },
    { label: 'Casos Solucionados Definitivos', value: `${metricas.totalResueltos}`, sub: `Pendientes: ${metricas.totalAbiertos}`, color: emerald },
    { label: 'Cumplimiento Acuerdos SLA', value: `${metricas.porcentajeSLA}%`, sub: 'Meta contractual: 90%', color: metricas.porcentajeSLA >= 90 ? emerald : orange },
  ];

  kpisFila1.forEach((kpi, idx) => {
    const cardX = marginX + idx * (cardWidth + 5);
    doc.setFillColor(...bgLight);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderLight);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(kpi.label.toUpperCase(), cardX + 3, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, cardX + 3, currentY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text(kpi.sub, cardX + 3, currentY + 14);
  });

  currentY += cardHeight + 4;

  const kpisFila2 = [
    { label: 'Tiempo Promedio 1ra Respuesta', value: `${metricas.promedioPrimeraRespH}h`, sub: 'Meta: Menor a 4h hábiles', color: sfsBlue },
    { label: 'Tiempo Medio Solución (MTTR)', value: `${metricas.promedioSolucionH}h`, sub: 'Horas laborales COT', color: sfsBlue },
    { label: 'Satisfacción del Cliente (CSAT)', value: `${metricas.csatPromedio} / 5.0`, sub: 'Encuestas post-servicio', color: orange },
  ];

  kpisFila2.forEach((kpi, idx) => {
    const cardX = marginX + idx * (cardWidth + 5);
    doc.setFillColor(...bgLight);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderLight);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(kpi.label.toUpperCase(), cardX + 3, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, cardX + 3, currentY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text(kpi.sub, cardX + 3, currentY + 14);
  });

  currentY += cardHeight + 8;

  // 5. Breakdown by Priority Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...marineBlue);
  doc.text('2. DISTRIBUCIÓN Y CUMPLIMIENTO POR PRIORIDAD CONTRACTUAL', marginX, currentY);

  currentY += 3;

  const prioridades = ['critica', 'alta', 'media', 'baja'] as const;
  const prioData = prioridades.map((p) => {
    const filtrados = tickets.filter((t) => t.prioridad === p);
    const cumplidos = filtrados.filter((t) => t.slaSolucionCumplido === true).length;
    const resueltos = filtrados.filter((t) => t.estado === 'resuelto' || t.estado === 'cerrado').length;
    const pct = resueltos > 0 ? Math.round((cumplidos / resueltos) * 100) : 100;
    const metaTexto = p === 'critica' ? '1h Resp / 4h Sol' : p === 'alta' ? '4h Resp / 24h Sol' : p === 'media' ? '8h Resp / 72h Sol' : '24h Resp / 120h Sol';

    return [
      p.toUpperCase(),
      metaTexto,
      `${filtrados.length} tickets`,
      `${resueltos} resueltos`,
      `${pct}%`,
      pct >= 90 ? 'CUMPLE' : 'EN SEGUIMIENTO',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Prioridad', 'Ventana SLA Hábil', 'Volumen', 'Resueltos', '% Cumplimiento', 'Estado']],
    body: prioData,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: textDark,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: marineBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 6. Detailed Incident Tickets Table (Top / Sample of filtered period)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...marineBlue);
  doc.text('3. DETALLE DE CASOS GESTIONADOS EN EL PERÍODO', marginX, currentY);

  currentY += 3;

  const sampleTickets = tickets.slice(0, 25).map((t) => {
    const empNombre = (t.empresaId && empresasMap[t.empresaId]) || t.empresaId || 'Empresa';
    const agenteNombre = t.asignadoAId ? (usuariosMap[t.asignadoAId] || 'Asignado') : 'Sin asignar';
    const csat = t.calificacion?.estrellas ? `${t.calificacion.estrellas}★` : '-';
    const cumplioSla = t.slaSolucionCumplido === true ? 'Sí' : t.slaSolucionCumplido === false ? 'No' : 'En curso';
    const asuntoText = (t.asunto || 'Sin asunto');

    return [
      t.numero || 'SFS-000',
      empNombre.length > 20 ? empNombre.slice(0, 20) + '...' : empNombre,
      asuntoText.length > 32 ? asuntoText.slice(0, 32) + '...' : asuntoText,
      (t.prioridad || '').toUpperCase(),
      (t.estado || '').replace(/_/g, ' ').toUpperCase(),
      agenteNombre.split(' ')[0] || 'Asignado',
      t.creadoEn ? formatoFechaHoraCO(t.creadoEn).slice(0, 10) : '-',
      cumplioSla,
      csat,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['# Caso', 'Empresa Cliente', 'Asunto', 'Prior.', 'Estado', 'Especialista', 'Fecha', 'SLA', 'CSAT']],
    body: sampleTickets,
    margin: { left: marginX, right: marginX },
    theme: 'striped',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: textDark,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: sfsBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNum = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text(
        'Software Factory and Services S.A.S. • Mesa de Ayuda Soporte ERP • Documento Oficial Confidencial',
        marginX,
        pageHeight - 8
      );
      doc.text(`Página ${data.pageNumber}`, pageWidth - marginX, pageHeight - 8, {
        align: 'right',
      });
    },
  });

  // Download PDF file directly in browser without popup/window.open
  const fechaSlug = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `Reporte_Mensual_SLA_SFS_${fechaSlug}.pdf`;
  doc.save(nombreArchivo);
}
