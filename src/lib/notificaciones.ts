import { Notificacion, Ticket, Usuario } from '../types';

export interface EmailPayload {
  to: string;
  toName: string;
  subject: string;
  bodyHtml: string;
  ticketId?: string;
  evento: string;
}

/**
 * Stub para envío de notificaciones por correo electrónico (SMTP/SendGrid/SES).
 * Registra en consola el despacho simulado para auditoría en desarrollo y producción.
 */
export async function enviarNotificacionPorCorreo(payload: EmailPayload): Promise<{ enviado: boolean; messageId: string }> {
  const simulatedId = `msg_sfs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Simular latencia de red de pasarela de correos
  await new Promise((r) => setTimeout(r, 120));

  console.info(`[SFS Mailer Stub] 📧 Correo despachado a: ${payload.to} (${payload.toName})`);
  console.info(`[SFS Mailer Stub] Asunto: ${payload.subject}`);
  console.info(`[SFS Mailer Stub] Evento: ${payload.evento} | ID Mensaje: ${simulatedId}`);

  return {
    enviado: true,
    messageId: simulatedId,
  };
}

export function crearNotificacionTicket(
  destinatario: Usuario,
  tipo: Notificacion['tipo'],
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
      mensaje = `Has sido asignado al caso "${ticket.asunto}".`;
      break;
    case 'nueva_respuesta':
      titulo = `Nueva respuesta en ${ticket.numero}`;
      mensaje = `${detalleExtra || 'Hay una nueva actualización en tu ticket de soporte.'}`;
      break;
    case 'sla_vencer':
      titulo = `⚠️ Alerta de SLA: ${ticket.numero}`;
      mensaje = `El ticket está próximo a superar el tiempo acordado de solución.`;
      break;
    case 'ticket_resuelto':
      titulo = `Ticket solucionado: ${ticket.numero}`;
      mensaje = `El equipo de soporte ha resuelto "${ticket.asunto}". Por favor califica la atención.`;
      break;
    case 'anuncio':
      titulo = `Nuevo comunicado institucional`;
      mensaje = detalleExtra || 'Hay un nuevo anuncio de la mesa de ayuda SFS.';
      break;
  }

  // Despachar el correo stub en segundo plano
  enviarNotificacionPorCorreo({
    to: destinatario.email,
    toName: destinatario.nombre,
    subject: `[SFS Service Desk] ${titulo}`,
    bodyHtml: `<p>${mensaje}</p><p>Ver ticket en: <a href="/portal/ticket/${ticket.id}">SFS Service Desk</a></p>`,
    ticketId: ticket.id,
    evento: tipo,
  }).catch((err) => console.error('Error despachando correo stub', err));

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
