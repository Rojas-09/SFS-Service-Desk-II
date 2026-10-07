import { Notificacion, Ticket, Usuario, Anuncio, EmailSimulado, TipoEventoNotificacion } from '../types';

export interface EmailPayload {
  to: string;
  toName: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  ticketId?: string;
  ticketNumero?: string;
  anuncioId?: string;
  evento: TipoEventoNotificacion;
  metadatos?: Record<string, unknown>;
}

const STORAGE_KEY_CORREOS = 'sfs_correos_simulados_v1';

// In-memory cache + listeners
let correosEnMemoria: EmailSimulado[] = [];
const subscriptores: Array<(correo: EmailSimulado) => void> = [];

/**
 * Plantilla HTML corporativa con identidad SFS (#0B2A5B, #1565C0, #F37021)
 */
function generarHtmlEmail(params: {
  destinatarioNombre: string;
  tituloHeader: string;
  subtituloHeader: string;
  badgeTexto?: string;
  badgeColor?: string;
  contenidoPrincipalHtml: string;
  detallesTicket?: {
    numero?: string;
    asunto?: string;
    prioridad?: string;
    categoria?: string;
    estado?: string;
    empresa?: string;
  };
  botonTexto?: string;
  botonUrl?: string;
}): string {
  const {
    destinatarioNombre,
    tituloHeader,
    subtituloHeader,
    badgeTexto,
    badgeColor = '#1565C0',
    contenidoPrincipalHtml,
    detallesTicket,
    botonTexto = 'Ver en SFS Service Desk',
    botonUrl = '/portal',
  } = params;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tituloHeader}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F7FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F7FB; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Tarjeta Principal -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(11, 42, 91, 0.08); border: 1px solid #E3E8F0;">
          
          <!-- Encabezado Corporativo SFS -->
          <tr>
            <td style="background-color: #0B2A5B; padding: 28px 24px; text-align: left; border-bottom: 3px solid #F37021;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                      SFS <span style="color: #3FA2E8;">Service Desk</span>
                    </div>
                    <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                      Software Factory and Services S.A.S.
                    </div>
                  </td>
                  ${badgeTexto ? `
                  <td align="right">
                    <span style="display: inline-block; background-color: ${badgeColor}; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${badgeTexto}
                    </span>
                  </td>` : ''}
                </tr>
              </table>
              <div style="margin-top: 18px; font-size: 17px; font-weight: 700; color: #FFFFFF;">
                ${tituloHeader}
              </div>
              <div style="font-size: 13px; color: #CBD5E1; margin-top: 4px;">
                ${subtituloHeader}
              </div>
            </td>
          </tr>

          <!-- Contenido del Mensaje -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 14px; color: #64748B; margin-top: 0; margin-bottom: 16px;">
                Hola <strong style="color: #0B2A5B;">${destinatarioNombre}</strong>,
              </p>

              <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                ${contenidoPrincipalHtml}
              </div>

              ${detallesTicket ? `
              <!-- Ficha Resumen del Caso -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #1565C0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                      Ficha del Ticket • ${detallesTicket.numero || 'SFS'}
                    </div>
                    <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td width="30%" style="color: #64748B;">Asunto:</td>
                        <td width="70%" style="color: #0B2A5B; font-weight: 600;">${detallesTicket.asunto || 'N/A'}</td>
                      </tr>
                      ${detallesTicket.empresa ? `
                      <tr>
                        <td style="color: #64748B;">Empresa:</td>
                        <td style="color: #1E293B;">${detallesTicket.empresa}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #64748B;">Categoría:</td>
                        <td style="color: #1E293B;">${detallesTicket.categoria || 'Soporte'}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B;">Prioridad:</td>
                        <td style="color: #1E293B; font-weight: 600;">${detallesTicket.prioridad || 'Media'}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B;">Estado:</td>
                        <td style="color: #1E293B;">${detallesTicket.estado || 'Activo'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>` : ''}

              <!-- Botón CTA Primario -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${botonUrl}" target="_blank" style="display: inline-block; background-color: #1565C0; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 6px rgba(21, 101, 192, 0.35);">
                      ${botonTexto} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-bottom: 0;">
                También puedes responder a este ticket directamente ingresando a la plataforma.
              </p>
            </td>
          </tr>

          <!-- Pie Institucional -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 18px 24px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #64748B; line-height: 1.5;">
              <div><strong>Mesa de Ayuda SFS Service Desk</strong></div>
              <div>Software Factory and Services S.A.S. • NIT 901.428.532-1</div>
              <div>Bogotá D.C., Colombia • Horario hábil: Lun-Vie 08:00 - 18:00 (COT America/Bogota)</div>
              <div style="margin-top: 6px; color: #94A3B8;">Este es un mensaje automático de notificación del sistema.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Inicializa y recupera los correos simulados de persistencia local
 */
export function obtenerHistorialCorreosSimulados(): EmailSimulado[] {
  if (correosEnMemoria.length > 0) {
    return [...correosEnMemoria];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CORREOS);
    if (raw) {
      correosEnMemoria = JSON.parse(raw);
      return [...correosEnMemoria];
    }
  } catch (err) {
    console.warn('[SFS Mailer] No se pudo leer localStorage:', err);
  }

  // Semilla inicial realista de demostración
  const ahora = new Date();
  const hace2Horas = new Date(ahora.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const hace5Horas = new Date(ahora.getTime() - 5 * 60 * 60 * 1000).toISOString();

  correosEnMemoria = [
    {
      id: `msg_sfs_seed_1`,
      to: 'carlos.mendoza@cafedecolombia.com',
      toName: 'Carlos Mendoza',
      from: 'soporte@sfs.com.co',
      fromName: 'SFS Service Desk',
      subject: '[SFS Service Desk] Nueva respuesta en #SFS-1048: Inconsistencia en liquidación de trilla',
      bodyHtml: '<p>Tu especialista asignado ha respondido con una solución técnica previa.</p>',
      bodyText: 'Tu especialista asignado ha respondido con una solución técnica previa.',
      evento: 'nueva_respuesta',
      ticketId: 'tkt-1048',
      ticketNumero: '#SFS-1048',
      estado: 'entregado',
      fechaEnvio: hace2Horas,
    },
    {
      id: `msg_sfs_seed_2`,
      to: 'laura.castillo@sfs.com.co',
      toName: 'Laura Castillo',
      from: 'alertas@sfs.com.co',
      fromName: 'SFS Mesa de Ayuda',
      subject: '[SFS Service Desk] Caso asignado a ti: #SFS-1052 - Solicitud de certificado SSL',
      bodyHtml: '<p>Se te ha asignado un nuevo ticket con SLA Crítico.</p>',
      bodyText: 'Se te ha asignado un nuevo ticket con SLA Crítico.',
      evento: 'ticket_asignado',
      ticketId: 'tkt-1052',
      ticketNumero: '#SFS-1052',
      estado: 'entregado',
      fechaEnvio: hace5Horas,
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY_CORREOS, JSON.stringify(correosEnMemoria));
  } catch {
    // ignore
  }

  return [...correosEnMemoria];
}

/**
 * Guarda un correo despachado en el historial de simulación
 */
function registrarCorreoEnHistorial(correo: EmailSimulado): void {
  correosEnMemoria = [correo, ...correosEnMemoria].slice(0, 100); // Guardar los últimos 100
  try {
    localStorage.setItem(STORAGE_KEY_CORREOS, JSON.stringify(correosEnMemoria));
  } catch (err) {
    console.warn('[SFS Mailer] No se pudo guardar correo en localStorage:', err);
  }

  // Notificar a observadores
  subscriptores.forEach((listener) => {
    try {
      listener(correo);
    } catch (e) {
      console.error('[SFS Mailer] Error en suscriptor de correos:', e);
    }
  });
}

/**
 * Permite a componentes UI escuchar en vivo los correos despachados
 */
export function suscribirAEnvioCorreos(listener: (correo: EmailSimulado) => void): () => void {
  subscriptores.push(listener);
  return () => {
    const idx = subscriptores.indexOf(listener);
    if (idx !== -1) subscriptores.splice(idx, 1);
  };
}

/**
 * Limpia el historial de correos simulados
 */
export function limpiarHistorialCorreosSimulados(): void {
  correosEnMemoria = [];
  try {
    localStorage.removeItem(STORAGE_KEY_CORREOS);
  } catch {
    // ignore
  }
}

/**
 * Servicio Central de Envío de Notificaciones por Correo Electrónico (Simulado / SMTP Stub)
 * Simula la pasarela de salida con entrega instantánea/asíncrona y logs auditables.
 */
export async function enviarNotificacionPorCorreo(
  payload: EmailPayload
): Promise<{ enviado: boolean; messageId: string; correo: EmailSimulado }> {
  const simulatedId = `msg_sfs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const ahora = new Date().toISOString();

  // Simular pequeña latencia de pasarela SMTP (80ms)
  await new Promise((resolve) => setTimeout(resolve, 80));

  const emailRegistro: EmailSimulado = {
    id: simulatedId,
    to: payload.to,
    toName: payload.toName,
    from: 'soporte@sfs.com.co',
    fromName: 'SFS Service Desk',
    subject: payload.subject,
    bodyHtml: payload.bodyHtml || `<p>${payload.bodyText || payload.subject}</p>`,
    bodyText: payload.bodyText || payload.subject,
    evento: payload.evento,
    ticketId: payload.ticketId,
    ticketNumero: payload.ticketNumero,
    anuncioId: payload.anuncioId,
    estado: 'entregado',
    fechaEnvio: ahora,
    metadatos: payload.metadatos,
  };

  registrarCorreoEnHistorial(emailRegistro);

  // Registro en consola para monitoreo y depuración
  console.info(
    `%c[SFS Mailer Simulado] 📧 %c${payload.evento.toUpperCase()} → %c${payload.to} (${payload.toName})`,
    'color: #F37021; font-weight: bold;',
    'color: #1565C0; font-weight: bold;',
    'color: #0B2A5B;'
  );
  console.info(`   Asunto: "${payload.subject}" | ID: ${simulatedId}`);

  return {
    enviado: true,
    messageId: simulatedId,
    correo: emailRegistro,
  };
}

/**
 * Generador estándar de notificaciones in-app
 */
export function crearNotificacionTicket(
  destinatario: Usuario,
  tipo: TipoEventoNotificacion,
  ticket: Ticket,
  detalleExtra?: string
): Notificacion {
  let titulo = '';
  let mensaje = '';

  switch (tipo) {
    case 'ticket_nuevo':
      titulo = `Nuevo ticket registrado: ${ticket.numero}`;
      mensaje = `Se ha creado el ticket "${ticket.asunto}". ${detalleExtra || ''}`;
      break;
    case 'ticket_asignado':
      titulo = `Ticket asignado a ti: ${ticket.numero}`;
      mensaje = `Has sido asignado para atender el caso "${ticket.asunto}".`;
      break;
    case 'nueva_respuesta':
      titulo = `Nueva respuesta en ${ticket.numero}`;
      mensaje = detalleExtra || `Hay una nueva respuesta en el caso "${ticket.asunto}".`;
      break;
    case 'sla_vencer':
      titulo = `⚠️ Alerta de SLA: ${ticket.numero}`;
      mensaje = `El ticket está próximo a superar el tiempo límite acordado de atención.`;
      break;
    case 'ticket_resuelto':
      titulo = `Ticket solucionado: ${ticket.numero}`;
      mensaje = `El equipo de soporte ha resuelto "${ticket.asunto}". Por favor califica la atención.`;
      break;
    case 'ticket_reabierto':
      titulo = `Ticket reabierto: ${ticket.numero}`;
      mensaje = detalleExtra || `El caso "${ticket.asunto}" ha sido reabierto para revisión.`;
      break;
    case 'anuncio':
      titulo = `Nuevo comunicado institucional`;
      mensaje = detalleExtra || 'Hay un nuevo anuncio de la mesa de ayuda SFS.';
      break;
  }

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    usuarioId: destinatario.id,
    titulo,
    mensaje,
    tipo,
    ticketId: ticket.id,
    leida: false,
    creadaEn: new Date().toISOString(),
  };
}

/**
 * SERVICIO INTEGRADO DE NOTIFICACIONES SFS
 * Orquesta la creación de notificaciones in-app y el despacho de correos simulados
 * para todos los eventos del ciclo de vida de tickets y anuncios.
 */
export const servicioNotificaciones = {
  /**
   * Evento: Creación de un nuevo ticket
   * - Confirma al cliente por correo que su radicado fue recibido.
   * - Notifica in-app y por correo al equipo supervisor y al agente asignado.
   */
  async despacharEventoTicketCreado(params: {
    ticket: Ticket;
    creador: Usuario;
    supervisores: Usuario[];
    agenteAsignado?: Usuario;
    nombreEmpresa?: string;
  }): Promise<{ notificaciones: Notificacion[]; correos: EmailSimulado[] }> {
    const { ticket, creador, supervisores, agenteAsignado, nombreEmpresa } = params;
    const notificaciones: Notificacion[] = [];
    const correos: EmailSimulado[] = [];

    // 1. Correo de confirmación de radicación al cliente creador
    const htmlCliente = generarHtmlEmail({
      destinatarioNombre: creador.nombre,
      tituloHeader: `Radicado Recibido: ${ticket.numero}`,
      subtituloHeader: 'Tu requerimiento está en cola de atención de nuestro equipo técnico',
      badgeTexto: ticket.prioridad.toUpperCase(),
      badgeColor: ticket.prioridad === 'critica' || ticket.prioridad === 'alta' ? '#F37021' : '#1565C0',
      contenidoPrincipalHtml: `
        <p>Hemos recibido tu requerimiento exitosamente. Un especialista de la mesa de ayuda de SFS tomará tu caso y te brindará respuesta dentro del tiempo acordado por SLA.</p>
        <p><strong>Descripción inicial:</strong><br><em>"${ticket.descripcion.substring(0, 180)}${ticket.descripcion.length > 180 ? '...' : ''}"</em></p>
      `,
      detallesTicket: {
        numero: ticket.numero,
        asunto: ticket.asunto,
        prioridad: ticket.prioridad,
        categoria: ticket.categoria,
        estado: ticket.estado,
        empresa: nombreEmpresa,
      },
      botonTexto: 'Ver mi Ticket en el Portal',
      botonUrl: `/portal/ticket/${ticket.id}`,
    });

    const resCli = await enviarNotificacionPorCorreo({
      to: creador.email,
      toName: `${creador.nombre} ${creador.apellidos}`,
      subject: `[SFS Service Desk] Radicación exitosa: ${ticket.numero} - ${ticket.asunto}`,
      bodyHtml: htmlCliente,
      bodyText: `Tu ticket ${ticket.numero} ha sido radicado. Puedes seguir su avance en el portal de clientes.`,
      ticketId: ticket.id,
      ticketNumero: ticket.numero,
      evento: 'ticket_nuevo',
    });
    correos.push(resCli.correo);

    // 2. Notificaciones y correos a supervisores/administradores
    for (const sup of supervisores) {
      if (sup.id === creador.id) continue;
      const notif = crearNotificacionTicket(sup, 'ticket_nuevo', ticket, `Cliente: ${creador.nombre} (${nombreEmpresa || 'Cliente'})`);
      notificaciones.push(notif);

      const htmlSup = generarHtmlEmail({
        destinatarioNombre: sup.nombre,
        tituloHeader: `Nuevo Ticket: ${ticket.numero}`,
        subtituloHeader: `Reportado por ${creador.nombre} • ${nombreEmpresa || 'Empresa Cliente'}`,
        badgeTexto: ticket.prioridad.toUpperCase(),
        badgeColor: ticket.prioridad === 'critica' ? '#DC2626' : '#F37021',
        contenidoPrincipalHtml: `
          <p>Se ha registrado un nuevo ticket en la mesa de ayuda que requiere asignación o seguimiento.</p>
          <p><strong>Asunto:</strong> ${ticket.asunto}</p>
        `,
        detallesTicket: {
          numero: ticket.numero,
          asunto: ticket.asunto,
          prioridad: ticket.prioridad,
          categoria: ticket.categoria,
          estado: ticket.estado,
          empresa: nombreEmpresa,
        },
        botonTexto: 'Atender en Consola SFS',
        botonUrl: `/consola/ticket/${ticket.id}`,
      });

      const resSup = await enviarNotificacionPorCorreo({
        to: sup.email,
        toName: `${sup.nombre} ${sup.apellidos}`,
        subject: `[Alerta SFS] Nuevo ticket ${ticket.numero}: ${ticket.asunto}`,
        bodyHtml: htmlSup,
        bodyText: `Nuevo ticket ${ticket.numero} registrado por ${creador.nombre}.`,
        ticketId: ticket.id,
        ticketNumero: ticket.numero,
        evento: 'ticket_nuevo',
      });
      correos.push(resSup.correo);
    }

    // 3. Notificación al agente asignado si se asignó de entrada
    if (agenteAsignado && agenteAsignado.id !== creador.id) {
      const notifAgente = crearNotificacionTicket(agenteAsignado, 'ticket_asignado', ticket);
      notificaciones.push(notifAgente);

      const htmlAgente = generarHtmlEmail({
        destinatarioNombre: agenteAsignado.nombre,
        tituloHeader: `Caso Asignado: ${ticket.numero}`,
        subtituloHeader: `Se te ha asignado este caso para diagnóstico y respuesta`,
        badgeTexto: 'ASIGNADO',
        badgeColor: '#1565C0',
        contenidoPrincipalHtml: `
          <p>Has sido asignado como especialista a cargo del caso <strong>${ticket.numero}</strong>.</p>
          <p>Por favor revisa la información inicial y emite la primera respuesta dentro de la ventana de SLA.</p>
        `,
        detallesTicket: {
          numero: ticket.numero,
          asunto: ticket.asunto,
          prioridad: ticket.prioridad,
          categoria: ticket.categoria,
          estado: 'asignado',
          empresa: nombreEmpresa,
        },
        botonTexto: 'Abrir Caso en Consola',
        botonUrl: `/consola/ticket/${ticket.id}`,
      });

      const resAgente = await enviarNotificacionPorCorreo({
        to: agenteAsignado.email,
        toName: `${agenteAsignado.nombre} ${agenteAsignado.apellidos}`,
        subject: `[SFS Asignación] Te han asignado el caso ${ticket.numero} - ${ticket.asunto}`,
        bodyHtml: htmlAgente,
        bodyText: `Has sido asignado al ticket ${ticket.numero}.`,
        ticketId: ticket.id,
        ticketNumero: ticket.numero,
        evento: 'ticket_asignado',
      });
      correos.push(resAgente.correo);
    }

    return { notificaciones, correos };
  },

  /**
   * Evento: Respuesta agregada en el hilo del ticket
   * - Si es nota interna: NO notifica al cliente (100% confidencial SFS).
   * - Si es cliente respondiendo: notifica al agente asignado / supervisores.
   * - Si es agente respondiendo: notifica al cliente con extracto del mensaje.
   */
  async despacharEventoRespuesta(params: {
    ticket: Ticket;
    remitente: Usuario;
    destinatario: Usuario;
    esNotaInterna: boolean;
    cuerpoMensaje: string;
    nombreEmpresa?: string;
  }): Promise<{ notificaciones: Notificacion[]; correos: EmailSimulado[] }> {
    const { ticket, remitente, destinatario, esNotaInterna, cuerpoMensaje, nombreEmpresa } = params;
    const notificaciones: Notificacion[] = [];
    const correos: EmailSimulado[] = [];

    // Si es nota interna, jamás se envía notificación ni correo al cliente externo
    if (esNotaInterna) {
      console.info(`[SFS Mailer] Nota interna confidencial en ${ticket.numero} registrada. No se emite correo a cliente.`);
      return { notificaciones, correos };
    }

    // Preparar notificación in-app
    const esRespuestaSFS = remitente.rol !== 'cliente';
    const detalle = esRespuestaSFS
      ? `${remitente.nombre} (SFS) ha respondido a tu requerimiento.`
      : `${remitente.nombre} (${nombreEmpresa || 'Cliente'}) ha agregado un comentario.`;

    const notif = crearNotificacionTicket(destinatario, 'nueva_respuesta', ticket, detalle);
    notificaciones.push(notif);

    // Preparar correo electrónico simulado
    const extracto = cuerpoMensaje.length > 280 ? `${cuerpoMensaje.substring(0, 280)}...` : cuerpoMensaje;

    const htmlEmail = generarHtmlEmail({
      destinatarioNombre: destinatario.nombre,
      tituloHeader: `Nueva Respuesta en ${ticket.numero}`,
      subtituloHeader: `Mensaje de ${remitente.nombre} ${remitente.apellidos} ${esRespuestaSFS ? '(Equipo SFS)' : ''}`,
      badgeTexto: 'ACTUALIZACIÓN',
      badgeColor: '#3FA2E8',
      contenidoPrincipalHtml: `
        <div style="background-color: #F8FAFC; border-left: 4px solid #1565C0; padding: 14px 16px; border-radius: 4px; margin-bottom: 18px; font-style: italic;">
          "${extracto}"
        </div>
        <p>Puedes ingresar al sistema para continuar la conversación y adjuntar información adicional si es necesario.</p>
      `,
      detallesTicket: {
        numero: ticket.numero,
        asunto: ticket.asunto,
        prioridad: ticket.prioridad,
        categoria: ticket.categoria,
        estado: ticket.estado,
        empresa: nombreEmpresa,
      },
      botonTexto: destinatario.rol === 'cliente' ? 'Ver Respuesta en el Portal' : 'Abrir Caso en Consola',
      botonUrl: destinatario.rol === 'cliente' ? `/portal/ticket/${ticket.id}` : `/consola/ticket/${ticket.id}`,
    });

    const resMail = await enviarNotificacionPorCorreo({
      to: destinatario.email,
      toName: `${destinatario.nombre} ${destinatario.apellidos}`,
      subject: `[SFS Service Desk] Nueva respuesta en ${ticket.numero}: ${ticket.asunto}`,
      bodyHtml: htmlEmail,
      bodyText: `${remitente.nombre} ha respondido en el ticket ${ticket.numero}: "${extracto}"`,
      ticketId: ticket.id,
      ticketNumero: ticket.numero,
      evento: 'nueva_respuesta',
    });
    correos.push(resMail.correo);

    return { notificaciones, correos };
  },

  /**
   * Evento: Asignación de ticket a un agente
   */
  async despacharEventoTicketAsignado(params: {
    ticket: Ticket;
    agente: Usuario;
    asignadoPor?: Usuario;
    nombreEmpresa?: string;
  }): Promise<{ notificaciones: Notificacion[]; correos: EmailSimulado[] }> {
    const { ticket, agente, asignadoPor, nombreEmpresa } = params;
    const notificaciones: Notificacion[] = [];
    const correos: EmailSimulado[] = [];

    const notif = crearNotificacionTicket(agente, 'ticket_asignado', ticket);
    notificaciones.push(notif);

    const htmlEmail = generarHtmlEmail({
      destinatarioNombre: agente.nombre,
      tituloHeader: `Caso Asignado: ${ticket.numero}`,
      subtituloHeader: asignadoPor ? `Asignado por ${asignadoPor.nombre}` : 'Asignación automática por turnos',
      badgeTexto: ticket.prioridad.toUpperCase(),
      badgeColor: ticket.prioridad === 'critica' ? '#DC2626' : '#1565C0',
      contenidoPrincipalHtml: `
        <p>Se te ha transferido o asignado la atención del ticket <strong>${ticket.numero}</strong> de la empresa <strong>${nombreEmpresa || 'Cliente'}</strong>.</p>
        <p><strong>Asunto:</strong> ${ticket.asunto}</p>
      `,
      detallesTicket: {
        numero: ticket.numero,
        asunto: ticket.asunto,
        prioridad: ticket.prioridad,
        categoria: ticket.categoria,
        estado: 'asignado',
        empresa: nombreEmpresa,
      },
      botonTexto: 'Revisar Caso en Consola',
      botonUrl: `/consola/ticket/${ticket.id}`,
    });

    const resMail = await enviarNotificacionPorCorreo({
      to: agente.email,
      toName: `${agente.nombre} ${agente.apellidos}`,
      subject: `[SFS Asignación] Se te asignó el caso ${ticket.numero}: ${ticket.asunto}`,
      bodyHtml: htmlEmail,
      bodyText: `Has sido asignado al ticket ${ticket.numero}.`,
      ticketId: ticket.id,
      ticketNumero: ticket.numero,
      evento: 'ticket_asignado',
    });
    correos.push(resMail.correo);

    return { notificaciones, correos };
  },

  /**
   * Evento: Ticket resuelto (invitación a encuesta de satisfacción CSAT)
   */
  async despacharEventoTicketResuelto(params: {
    ticket: Ticket;
    cliente: Usuario;
    agente?: Usuario;
    nombreEmpresa?: string;
  }): Promise<{ notificaciones: Notificacion[]; correos: EmailSimulado[] }> {
    const { ticket, cliente, agente, nombreEmpresa } = params;
    const notificaciones: Notificacion[] = [];
    const correos: EmailSimulado[] = [];

    const notif = crearNotificacionTicket(cliente, 'ticket_resuelto', ticket);
    notificaciones.push(notif);

    const htmlEmail = generarHtmlEmail({
      destinatarioNombre: cliente.nombre,
      tituloHeader: `Caso Solucionado: ${ticket.numero}`,
      subtituloHeader: `Atendido por ${agente ? agente.nombre : 'Equipo de Soporte SFS'}`,
      badgeTexto: 'RESUELTO',
      badgeColor: '#16A34A',
      contenidoPrincipalHtml: `
        <p>Nos complace informarte que tu requerimiento <strong>${ticket.numero}</strong> ha sido resuelto por nuestro equipo de soporte técnico.</p>
        <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
          <div style="font-weight: 700; color: #065F46; font-size: 15px; margin-bottom: 6px;">
            ¿Cómo calificarías nuestra atención?
          </div>
          <div style="font-size: 22px; letter-spacing: 4px; color: #F59E0B; margin-bottom: 8px;">
            ★★★★★
          </div>
          <p style="font-size: 12px; color: #047857; margin: 0;">
            Tu opinión nos ayuda a mantener los más altos estándares de calidad en Software Factory and Services.
          </p>
        </div>
        <p style="font-size: 13px; color: #64748B;">Si consideras que el problema persiste o requieres ajustes adicionales, puedes reabrir el caso desde el portal.</p>
      `,
      detallesTicket: {
        numero: ticket.numero,
        asunto: ticket.asunto,
        prioridad: ticket.prioridad,
        categoria: ticket.categoria,
        estado: 'resuelto',
        empresa: nombreEmpresa,
      },
      botonTexto: 'Calificar Atención y Ver Caso',
      botonUrl: `/portal/ticket/${ticket.id}`,
    });

    const resMail = await enviarNotificacionPorCorreo({
      to: cliente.email,
      toName: `${cliente.nombre} ${cliente.apellidos}`,
      subject: `[SFS Service Desk] Solución de Ticket ${ticket.numero} - Por favor califica la atención`,
      bodyHtml: htmlEmail,
      bodyText: `Tu ticket ${ticket.numero} ha sido resuelto. Por favor ingresa al portal para calificar la atención.`,
      ticketId: ticket.id,
      ticketNumero: ticket.numero,
      evento: 'ticket_resuelto',
    });
    correos.push(resMail.correo);

    return { notificaciones, correos };
  },

  /**
   * Evento: Ticket reabierto por el cliente o agente
   */
  async despacharEventoTicketReabierto(params: {
    ticket: Ticket;
    reabiertoPor: Usuario;
    agente?: Usuario;
    supervisores: Usuario[];
    nombreEmpresa?: string;
  }): Promise<{ notificaciones: Notificacion[]; correos: EmailSimulado[] }> {
    const { ticket, reabiertoPor, agente, supervisores, nombreEmpresa } = params;
    const notificaciones: Notificacion[] = [];
    const correos: EmailSimulado[] = [];

    const candidatos = [agente, ...supervisores];
    const destinatarios = candidatos.filter(
      (u): u is Usuario => u !== undefined && u.id !== reabiertoPor.id
    );

    for (const dest of destinatarios) {
      const notif = crearNotificacionTicket(
        dest,
        'ticket_reabierto',
        ticket,
        `Reabierto por ${reabiertoPor.nombre} (${nombreEmpresa || 'Cliente'})`
      );
      notificaciones.push(notif);

      const htmlEmail = generarHtmlEmail({
        destinatarioNombre: dest.nombre,
        tituloHeader: `Caso Reabierto: ${ticket.numero}`,
        subtituloHeader: `Reabierto por ${reabiertoPor.nombre} • ${nombreEmpresa || 'Cliente'}`,
        badgeTexto: 'REABIERTO',
        badgeColor: '#F59E0B',
        contenidoPrincipalHtml: `
          <p>El cliente ha solicitado revisión adicional del caso <strong>${ticket.numero}</strong> luego de haber sido marcado como resuelto.</p>
          <p><strong>Asunto:</strong> ${ticket.asunto}</p>
        `,
        detallesTicket: {
          numero: ticket.numero,
          asunto: ticket.asunto,
          prioridad: ticket.prioridad,
          categoria: ticket.categoria,
          estado: 'en_progreso',
          empresa: nombreEmpresa,
        },
        botonTexto: 'Revisar Caso Reabierto',
        botonUrl: `/consola/ticket/${ticket.id}`,
      });

      const resMail = await enviarNotificacionPorCorreo({
        to: dest.email,
        toName: `${dest.nombre} ${dest.apellidos}`,
        subject: `[Alerta SFS] Caso Reabierto: ${ticket.numero} - ${ticket.asunto}`,
        bodyHtml: htmlEmail,
        bodyText: `El caso ${ticket.numero} ha sido reabierto por ${reabiertoPor.nombre}.`,
        ticketId: ticket.id,
        ticketNumero: ticket.numero,
        evento: 'ticket_reabierto',
      });
      correos.push(resMail.correo);
    }

    return { notificaciones, correos };
  },

  /**
   * Evento: Publicación de un Comunicado Masivo / Anuncio
   * - Notifica in-app a toda la audiencia segmentada.
   * - Si los canales configurados incluyen 'correo' o 'ambos', despacha un correo simulado con diseño institucional.
   */
  async despacharEventoAnuncio(params: {
    anuncio: Anuncio;
    destinatarios: Usuario[];
  }): Promise<{ notificaciones: Notificacion[]; correos: EmailSimulado[] }> {
    const { anuncio, destinatarios } = params;
    const notificaciones: Notificacion[] = [];
    const correos: EmailSimulado[] = [];

    const badgePorTipo: Record<Anuncio['tipo'], { label: string; color: string }> = {
      informativo: { label: 'INFORMATIVO', color: '#1565C0' },
      mantenimiento: { label: 'MANTENIMIENTO PROGRAMADO', color: '#F59E0B' },
      incidente: { label: 'INCIDENTE ACTIVO', color: '#F37021' },
      novedad: { label: 'NOVEDAD DEL PRODUCTO', color: '#16A34A' },
    };

    const infoBadge = badgePorTipo[anuncio.tipo] || { label: 'COMUNICADO', color: '#1565C0' };
    const ahora = new Date().toISOString();

    for (const dest of destinatarios) {
      // 1. Notificación in-app
      const notif: Notificacion = {
        id: `notif-anu-${Date.now()}-${dest.id}`,
        usuarioId: dest.id,
        titulo: `Comunicado SFS: ${anuncio.titulo}`,
        mensaje: anuncio.cuerpo.substring(0, 120),
        tipo: 'anuncio',
        leida: false,
        creadaEn: ahora,
      };
      notificaciones.push(notif);

      // 2. Correo electrónico (si el canal incluye correo o ambos)
      if (anuncio.canales === 'correo' || anuncio.canales === 'ambos') {
        const htmlEmail = generarHtmlEmail({
          destinatarioNombre: dest.nombre,
          tituloHeader: anuncio.titulo,
          subtituloHeader: 'Comunicado Oficial de la Mesa de Ayuda SFS',
          badgeTexto: infoBadge.label,
          badgeColor: infoBadge.color,
          contenidoPrincipalHtml: `
            <div style="font-size: 15px; line-height: 1.7; color: #1E293B;">
              ${anuncio.cuerpo}
            </div>
          `,
          botonTexto: 'Ver Comunicado en el Portal',
          botonUrl: dest.rol === 'cliente' ? '/portal' : '/consola/anuncios',
        });

        const resMail = await enviarNotificacionPorCorreo({
          to: dest.email,
          toName: `${dest.nombre} ${dest.apellidos}`,
          subject: `[SFS Comunicado] ${infoBadge.label}: ${anuncio.titulo}`,
          bodyHtml: htmlEmail,
          bodyText: `${anuncio.titulo}: ${anuncio.cuerpo}`,
          anuncioId: anuncio.id,
          evento: 'anuncio',
        });
        correos.push(resMail.correo);
      }
    }

    return { notificaciones, correos };
  },
};
