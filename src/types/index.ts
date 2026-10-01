export type RolUsuario = 'cliente' | 'agente' | 'supervisor' | 'admin';

export type EstadoTicket = 
  | 'nuevo' 
  | 'asignado' 
  | 'en_progreso' 
  | 'en_espera_cliente' 
  | 'resuelto' 
  | 'cerrado';

export type PrioridadTicket = 'baja' | 'media' | 'alta' | 'critica';

export type CategoriaTicket = 
  | 'error_sistema' 
  | 'duda_uso' 
  | 'solicitud_cambio' 
  | 'acceso_usuarios' 
  | 'reportes_dian'
  | 'otro';

export type ModuloAfectado =
  | 'ERP SFS Trilla'
  | 'Facturación Electrónica DIAN'
  | 'Exportaciones & Logística'
  | 'Control de Calidad & Catación'
  | 'Portal de Proveedores y Caficultores'
  | 'Inventarios & Almacén'
  | 'Seguridad & Accesos'
  | 'Infraestructura & Servidores';

export interface PlanSoporte {
  id: string;
  nombre: string;
  descripcion: string;
  horario: string;
  slaCriticoHoras: number;
  slaAltaHoras: number;
  slaMediaHoras: number;
  slaBajaHoras: number;
  soporteTelefonico: boolean;
}

export interface Empresa {
  id: string;
  nombre: string;
  nit: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  telefono: string;
  emailContacto: string;
  planSoporte: 'Gold 24/7' | 'Platinum Empresa' | 'Standard Pyme';
  activo: boolean;
  logoUrl?: string;
  creadoEn: string;
  totalTicketsHistorico?: number;
  ticketsAbiertos?: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
  cargo: string;
  telefono?: string;
  empresaId?: string; // Para clientes
  activo: boolean;
  avatarUrl?: string;
  creadoEn: string;
  ultimoAcceso?: string;
  requiereCambioPassword?: boolean;
}

export interface Adjunto {
  id: string;
  nombre: string;
  tamanoBytes: number;
  tipoMime: string;
  url: string;
}

export interface Mensaje {
  id: string;
  ticketId: string;
  autorId: string;
  autorNombre: string;
  autorRol: RolUsuario;
  autorEmpresa?: string;
  cuerpo: string;
  interno: boolean; // Si es nota interna exclusiva de SFS
  adjuntos: Adjunto[];
  creadoEn: string;
}

export interface EventoTicket {
  id: string;
  ticketId: string;
  tipo: 'creacion' | 'cambio_estado' | 'cambio_asignado' | 'cambio_prioridad' | 'nota_interna' | 'respuesta_cliente' | 'calificacion' | 'reapertura';
  descripcion: string;
  usuarioId: string;
  usuarioNombre: string;
  creadoEn: string;
}

export interface CalificacionTicket {
  estrellas: number; // 1 a 5
  comentario?: string;
  fecha: string;
}

export interface Ticket {
  id: string;
  numero: string; // ej: #SFS-1024
  asunto: string;
  descripcion: string;
  categoria: CategoriaTicket;
  modulo: ModuloAfectado;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  empresaId: string;
  creadoPorId: string;
  asignadoAId: string | null;
  etiquetas: string[];
  
  // SLA Fields
  slaPrimeraRespuestaVence: string; // ISO Date
  slaSolucionVence: string;        // ISO Date
  primeraRespuestaEn?: string;
  resueltoEn?: string;
  cerradoEn?: string;
  
  creadoEn: string;
  actualizadoEn: string;
  calificacion?: CalificacionTicket;
  
  // Métricas calculadas
  slaPrimeraRespuestaCumplido?: boolean;
  slaSolucionCumplido?: boolean;
}

export type TipoAnuncio = 'informativo' | 'mantenimiento' | 'incidente' | 'novedad';
export type AudienciaAnuncio = 'todas' | 'empresas_seleccionadas' | 'por_rol';
export type CanalAnuncio = 'banner' | 'correo' | 'ambos';
export type EstadoAnuncio = 'programado' | 'publicado' | 'expirado' | 'borrador';

export interface Anuncio {
  id: string;
  titulo: string;
  cuerpo: string;
  tipo: TipoAnuncio;
  audiencia: AudienciaAnuncio;
  empresasIds?: string[];
  rolesDestino?: RolUsuario[];
  canales: CanalAnuncio;
  publicarEn: string;
  expiraEn: string;
  fijado: boolean;
  estado: EstadoAnuncio;
  enviados: number;
  leidos: number;
  creadoPorId: string;
  creadoEn: string;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'ticket_nuevo' | 'ticket_asignado' | 'nueva_respuesta' | 'sla_vencer' | 'ticket_resuelto' | 'anuncio';
  ticketId?: string;
  leida: boolean;
  creadaEn: string;
}

export interface ReglaSLA {
  prioridad: PrioridadTicket;
  nombre: string;
  primeraRespuestaHoras: number;
  solucionHoras: number;
  descripcion: string;
}

export interface MacroRespuesta {
  id: string;
  titulo: string;
  atajo: string;
  categoria: CategoriaTicket | 'general';
  contenido: string;
}

export interface ConfiguracionSistema {
  horarioHabilInicio: string; // "08:00"
  horarioHabilFin: string;    // "18:00"
  diasHabiles: number[];       // [1,2,3,4,5] (Lun-Vie)
  zonaHoraria: string;         // "America/Bogota"
  reglaAsignacion: 'manual' | 'round_robin' | 'por_categoria';
  notificarPorCorreo: boolean;
}
