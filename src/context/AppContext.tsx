import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Usuario,
  Ticket,
  Mensaje,
  EventoTicket,
  Empresa,
  Anuncio,
  Notificacion,
  ReglaSLA,
  MacroRespuesta,
  ConfiguracionSistema,
  EstadoTicket,
  PrioridadTicket,
  CategoriaTicket,
  ModuloAfectado,
  Adjunto,
  EmailSimulado,
} from '../types';
import {
  MOCK_EMPRESAS,
  MOCK_USUARIOS,
  MOCK_TICKETS,
  MOCK_MENSAJES,
  MOCK_EVENTOS,
  MOCK_ANUNCIOS,
  MOCK_NOTIFICACIONES,
  REGLAS_SLA_DEFAULT,
  MOCK_MACROS,
  CONFIG_SISTEMA_DEFAULT,
} from '../lib/mock-data';
import { getCurrentUser, setCurrentUser as setStoredCurrentUser } from '../lib/auth';
import {
  crearNotificacionTicket,
  servicioNotificaciones,
  obtenerHistorialCorreosSimulados,
  limpiarHistorialCorreosSimulados,
  suscribirAEnvioCorreos,
} from '../lib/notificaciones';

interface ToastItem {
  id: string;
  tipo: 'exito' | 'advertencia' | 'error' | 'info';
  mensaje: string;
}

interface AppContextType {
  // Auth & Session
  currentUser: Usuario | null;
  setCurrentUser: (u: Usuario | null) => void;
  cambiarUsuarioSimulado: (userId: string) => void;
  cerrarSesion: () => void;

  // Routing
  currentPath: string;
  navigate: (path: string) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Data
  tickets: Ticket[];
  mensajes: Mensaje[];
  eventos: EventoTicket[];
  empresas: Empresa[];
  usuarios: Usuario[];
  anuncios: Anuncio[];
  notificaciones: Notificacion[];
  reglasSla: ReglaSLA[];
  macros: MacroRespuesta[];
  config: ConfiguracionSistema;

  // Notifications Drawer
  notificacionesAbiertas: boolean;
  setNotificacionesAbiertas: (abiertas: boolean) => void;
  abrirNotificaciones: () => void;
  cerrarNotificaciones: () => void;

  // Actions
  crearTicket: (datos: {
    asunto: string;
    descripcion: string;
    categoria: CategoriaTicket;
    modulo: ModuloAfectado;
    prioridad: PrioridadTicket;
    adjuntos?: Adjunto[];
  }) => Ticket;
  actualizarTicket: (id: string, cambios: Partial<Ticket>) => void;
  asignarTicket: (ticketId: string, agenteId: string | null) => void;
  cambiarEstadoTicket: (ticketId: string, nuevoEstado: EstadoTicket, comentario?: string) => void;
  asignarEnLote: (ticketsIds: string[], agenteId: string) => void;
  cambiarEstadoEnLote: (ticketsIds: string[], nuevoEstado: EstadoTicket) => void;
  agregarMensaje: (ticketId: string, cuerpo: string, interno: boolean, adjuntos?: Adjunto[]) => void;
  calificarTicket: (ticketId: string, estrellas: number, comentario?: string) => void;
  reabrirTicket: (ticketId: string, motivo: string) => void;
  
  // Announcements
  crearAnuncio: (anuncio: Omit<Anuncio, 'id' | 'enviados' | 'leidos' | 'creadoEn'>) => void;
  eliminarAnuncio: (id: string) => void;

  // Companies & Users
  guardarEmpresa: (empresa: Empresa) => void;
  guardarUsuario: (usuario: Usuario) => void;
  eliminarUsuario: (id: string) => void;
  guardarConfiguracion: (nuevaConfig: ConfiguracionSistema) => void;
  guardarReglasSla: (reglas: ReglaSLA[]) => void;
  guardarMacros: (macros: MacroRespuesta[]) => void;

  // Notifications
  marcarNotificacionLeida: (id: string) => void;
  marcarTodasNotificacionesLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  limpiarNotificacionesLeidas: () => void;

  // Servicio de Correos Simulados
  correosSimulados: EmailSimulado[];
  limpiarCorreosSimulados: () => void;

  // Toasts
  toasts: ToastItem[];
  showToast: (mensaje: string, tipo?: 'exito' | 'advertencia' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sfs_dark_mode');
      if (saved !== null) return saved === 'true';
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('sfs_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('sfs_dark_mode', 'false');
      }
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      showToast(next ? 'Modo oscuro activado' : 'Modo claro corporativo activado', 'info');
      return next;
    });
  };

  // User state
  const [currentUser, setCurrentUserState] = useState<Usuario | null>(() => getCurrentUser());

  const setCurrentUser = (u: Usuario | null) => {
    setCurrentUserState(u);
    setStoredCurrentUser(u);
  };

  // Path routing
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const user = getCurrentUser();
    if (!user) return '/login';
    return user.rol === 'cliente' ? '/portal' : '/consola/bandeja';
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = (mensaje: string, tipo: 'exito' | 'advertencia' | 'error' | 'info' = 'exito') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Entities state with LocalStorage caching
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_tickets_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_TICKETS;
  });

  const [mensajes, setMensajes] = useState<Mensaje[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_mensajes_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_MENSAJES;
  });

  const [eventos, setEventos] = useState<EventoTicket[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_eventos_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_EVENTOS;
  });

  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_empresas_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_EMPRESAS;
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_usuarios_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_USUARIOS;
  });

  const [anuncios, setAnuncios] = useState<Anuncio[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_anuncios_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_ANUNCIOS;
  });

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_notificaciones_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_NOTIFICACIONES;
  });

  // Global Notification Drawer State
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  // Historial reactivo de correos simulados
  const [correosSimulados, setCorreosSimulados] = useState<EmailSimulado[]>(() =>
    obtenerHistorialCorreosSimulados()
  );

  useEffect(() => {
    const unsub = suscribirAEnvioCorreos((nuevoCorreo) => {
      setCorreosSimulados((prev) => [nuevoCorreo, ...prev].slice(0, 100));
    });
    return unsub;
  }, []);

  const limpiarCorreosSimulados = () => {
    limpiarHistorialCorreosSimulados();
    setCorreosSimulados([]);
    showToast('Historial de correos simulados reiniciado', 'info');
  };
  const abrirNotificaciones = () => setNotificacionesAbiertas(true);
  const cerrarNotificaciones = () => setNotificacionesAbiertas(false);

  const [reglasSla, setReglasSla] = useState<ReglaSLA[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_sla_rules');
      if (raw) return JSON.parse(raw);
    } catch {}
    return REGLAS_SLA_DEFAULT;
  });

  const [macros, setMacros] = useState<MacroRespuesta[]>(() => {
    try {
      const raw = localStorage.getItem('sfs_macros_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_MACROS;
  });

  const [config, setConfig] = useState<ConfiguracionSistema>(() => {
    try {
      const raw = localStorage.getItem('sfs_config_data');
      if (raw) return JSON.parse(raw);
    } catch {}
    return CONFIG_SISTEMA_DEFAULT;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sfs_tickets_data', JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem('sfs_mensajes_data', JSON.stringify(mensajes));
    } catch {}
  }, [mensajes]);

  useEffect(() => {
    try {
      localStorage.setItem('sfs_eventos_data', JSON.stringify(eventos));
    } catch {}
  }, [eventos]);

  useEffect(() => {
    try {
      localStorage.setItem('sfs_anuncios_data', JSON.stringify(anuncios));
    } catch {}
  }, [anuncios]);

  useEffect(() => {
    try {
      localStorage.setItem('sfs_notificaciones_data', JSON.stringify(notificaciones));
    } catch {}
  }, [notificaciones]);

  const cambiarUsuarioSimulado = (userId: string) => {
    const user = usuarios.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Cambiado a rol: ${user.rol.toUpperCase()} (${user.nombre} ${user.apellidos})`, 'info');
      if (user.rol === 'cliente') {
        navigate('/portal');
      } else {
        if (currentPath.startsWith('/portal')) {
          navigate('/consola/bandeja');
        }
      }
    }
  };

  const cerrarSesion = () => {
    setCurrentUser(null);
    navigate('/login');
    showToast('Sesión cerrada correctamente', 'info');
  };

  // Actions
  const crearTicket = (datos: {
    asunto: string;
    descripcion: string;
    categoria: CategoriaTicket;
    modulo: ModuloAfectado;
    prioridad: PrioridadTicket;
    adjuntos?: Adjunto[];
  }): Ticket => {
    if (!currentUser) throw new Error('Usuario no autenticado');

    const nextIdNum = 1000 + tickets.length + 1;
    const ticketId = `tkt-${nextIdNum}`;
    const numero = `#SFS-${nextIdNum}`;
    const ahora = new Date();

    // SLA calculation based on priority
    let respHoras = 8;
    let solHoras = 72;
    const regla = reglasSla.find((r) => r.prioridad === datos.prioridad);
    if (regla) {
      respHoras = regla.primeraRespuestaHoras;
      solHoras = regla.solucionHoras;
    }

    const slaPrimera = new Date(ahora.getTime() + respHoras * 3600 * 1000).toISOString();
    const slaSolucion = new Date(ahora.getTime() + solHoras * 3600 * 1000).toISOString();

    // Check auto-assignment config
    let asignadoAId: string | null = null;
    if (config.reglaAsignacion === 'round_robin') {
      const agentesDisponibles = usuarios.filter((u) => u.rol === 'agente' && u.activo);
      if (agentesDisponibles.length > 0) {
        const idx = tickets.length % agentesDisponibles.length;
        asignadoAId = agentesDisponibles[idx].id;
      }
    }

    const nuevoTicket: Ticket = {
      id: ticketId,
      numero,
      asunto: datos.asunto,
      descripcion: datos.descripcion,
      categoria: datos.categoria,
      modulo: datos.modulo,
      prioridad: datos.prioridad,
      estado: asignadoAId ? 'asignado' : 'nuevo',
      empresaId: currentUser.empresaId || 'emp-1',
      creadoPorId: currentUser.id,
      asignadoAId,
      etiquetas: ['Nuevo', datos.modulo.split(' ')[0]],
      slaPrimeraRespuestaVence: slaPrimera,
      slaSolucionVence: slaSolucion,
      creadoEn: ahora.toISOString(),
      actualizadoEn: ahora.toISOString(),
    };

    // Mensaje inicial
    const primerMensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      ticketId,
      autorId: currentUser.id,
      autorNombre: `${currentUser.nombre} ${currentUser.apellidos}`,
      autorRol: currentUser.rol,
      cuerpo: datos.descripcion,
      interno: false,
      adjuntos: datos.adjuntos || [],
      creadoEn: ahora.toISOString(),
    };

    // Evento de creación
    const nuevoEvento: EventoTicket = {
      id: `evt-${Date.now()}`,
      ticketId,
      tipo: 'creacion',
      descripcion: `Ticket reportado por ${currentUser.nombre} ${currentUser.apellidos}`,
      usuarioId: currentUser.id,
      usuarioNombre: `${currentUser.nombre} ${currentUser.apellidos}`,
      creadoEn: ahora.toISOString(),
    };

    setTickets((prev) => [nuevoTicket, ...prev]);
    setMensajes((prev) => [...prev, primerMensaje]);
    setEventos((prev) => [...prev, nuevoEvento]);

    // Despachar evento a través del servicio de notificaciones simulado
    const empresaTicket = empresas.find((e) => e.id === currentUser.empresaId);
    const supervisores = usuarios.filter((u) => u.rol === 'supervisor' || u.rol === 'admin');
    const agenteAsignado = asignadoAId ? usuarios.find((u) => u.id === asignadoAId) : undefined;

    servicioNotificaciones
      .despacharEventoTicketCreado({
        ticket: nuevoTicket,
        creador: currentUser,
        supervisores,
        agenteAsignado,
        nombreEmpresa: empresaTicket?.nombre,
      })
      .then(({ notificaciones: nuevasNotifs }) => {
        if (nuevasNotifs.length > 0) {
          setNotificaciones((prev) => [...nuevasNotifs, ...prev]);
        }
      })
      .catch((err) => console.error('Error despachando notificaciones de ticket creado:', err));

    showToast(`Ticket ${numero} radicado exitosamente`, 'exito');
    return nuevoTicket;
  };

  const actualizarTicket = (id: string, cambios: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...cambios, actualizadoEn: new Date().toISOString() } : t))
    );
  };

  const asignarTicket = (ticketId: string, agenteId: string | null) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const agente = usuarios.find((u) => u.id === agenteId);
    const ahora = new Date().toISOString();

    const nuevoEstado: EstadoTicket = agenteId ? (ticket.estado === 'nuevo' ? 'asignado' : ticket.estado) : 'nuevo';

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              asignadoAId: agenteId,
              estado: nuevoEstado,
              actualizadoEn: ahora,
            }
          : t
      )
    );

    const evento: EventoTicket = {
      id: `evt-${Date.now()}`,
      ticketId,
      tipo: 'cambio_asignado',
      descripcion: agenteId
        ? `Asignado a ${agente ? `${agente.nombre} ${agente.apellidos}` : 'especialista SFS'}`
        : 'Desasignado (marcado como Sin Asignar)',
      usuarioId: currentUser?.id || 'sys',
      usuarioNombre: currentUser ? `${currentUser.nombre} ${currentUser.apellidos}` : 'Sistema',
      creadoEn: ahora,
    };
    setEventos((prev) => [...prev, evento]);

    if (agente && agente.id !== currentUser?.id) {
      const empresaTicket = empresas.find((e) => e.id === ticket.empresaId);
      servicioNotificaciones
        .despacharEventoTicketAsignado({
          ticket,
          agente,
          asignadoPor: currentUser || undefined,
          nombreEmpresa: empresaTicket?.nombre,
        })
        .then(({ notificaciones: nuevasNotifs }) => {
          if (nuevasNotifs.length > 0) {
            setNotificaciones((prev) => [...nuevasNotifs, ...prev]);
          }
        })
        .catch((err) => console.error('Error despachando asignación:', err));
    }

    showToast(agenteId ? `Ticket asignado a ${agente?.nombre}` : 'Ticket desasignado', 'exito');
  };

  const cambiarEstadoTicket = (ticketId: string, nuevoEstado: EstadoTicket, _comentario?: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const ahora = new Date().toISOString();
    const esResuelto = nuevoEstado === 'resuelto';
    const esCerrado = nuevoEstado === 'cerrado';

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const resueltoEn = esResuelto ? ahora : t.resueltoEn;
        const cerradoEn = esCerrado ? ahora : t.cerradoEn;
        const slaSolucionCumplido = resueltoEn ? new Date(resueltoEn) <= new Date(t.slaSolucionVence) : undefined;
        return {
          ...t,
          estado: nuevoEstado,
          resueltoEn,
          cerradoEn,
          slaSolucionCumplido,
          actualizadoEn: ahora,
        };
      })
    );

    const descripcionesEstado: Record<EstadoTicket, string> = {
      nuevo: 'Nuevo reporte',
      asignado: 'Asignado a especialista',
      en_progreso: 'En proceso de atención técnica',
      en_espera_cliente: 'En espera de respuesta o validación del cliente',
      resuelto: 'Marcado como Resuelto',
      cerrado: 'Cerrado definitivamente',
    };

    const evento: EventoTicket = {
      id: `evt-${Date.now()}`,
      ticketId,
      tipo: 'cambio_estado',
      descripcion: `Estado actualizado a "${descripcionesEstado[nuevoEstado]}"`,
      usuarioId: currentUser?.id || 'sys',
      usuarioNombre: currentUser ? `${currentUser.nombre} ${currentUser.apellidos}` : 'Sistema',
      creadoEn: ahora,
    };
    setEventos((prev) => [...prev, evento]);

    // Notificar al creador si es resuelto
    if (esResuelto) {
      const creador = usuarios.find((u) => u.id === ticket.creadoPorId);
      const agente = ticket.asignadoAId ? usuarios.find((u) => u.id === ticket.asignadoAId) : undefined;
      const empresaTicket = empresas.find((e) => e.id === ticket.empresaId);
      if (creador) {
        servicioNotificaciones
          .despacharEventoTicketResuelto({
            ticket,
            cliente: creador,
            agente,
            nombreEmpresa: empresaTicket?.nombre,
          })
          .then(({ notificaciones: nuevasNotifs }) => {
            if (nuevasNotifs.length > 0) {
              setNotificaciones((prev) => [...nuevasNotifs, ...prev]);
            }
          })
          .catch((err) => console.error('Error despachando resolución:', err));
      }
    }

    showToast(`Estado actualizado a ${descripcionesEstado[nuevoEstado]}`, 'exito');
  };

  const asignarEnLote = (ticketsIds: string[], agenteId: string) => {
    const agente = usuarios.find((u) => u.id === agenteId);
    if (!agente) return;
    const ahora = new Date().toISOString();

    setTickets((prev) =>
      prev.map((t) => {
        if (ticketsIds.includes(t.id)) {
          return {
            ...t,
            asignadoAId: agenteId,
            estado: t.estado === 'nuevo' ? 'asignado' : t.estado,
            actualizadoEn: ahora,
          };
        }
        return t;
      })
    );

    ticketsIds.forEach((tId) => {
      setEventos((prev) => [
        ...prev,
        {
          id: `evt-${Date.now()}-${tId}`,
          ticketId: tId,
          tipo: 'cambio_asignado',
          descripcion: `Reasignado en lote a ${agente.nombre} ${agente.apellidos}`,
          usuarioId: currentUser?.id || 'sys',
          usuarioNombre: currentUser ? `${currentUser.nombre} ${currentUser.apellidos}` : 'Sistema',
          creadoEn: ahora,
        },
      ]);
    });

    showToast(`${ticketsIds.length} tickets asignados a ${agente.nombre}`, 'exito');
  };

  const cambiarEstadoEnLote = (ticketsIds: string[], nuevoEstado: EstadoTicket) => {
    const ahora = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (ticketsIds.includes(t.id)) {
          return {
            ...t,
            estado: nuevoEstado,
            resueltoEn: nuevoEstado === 'resuelto' ? ahora : t.resueltoEn,
            cerradoEn: nuevoEstado === 'cerrado' ? ahora : t.cerradoEn,
            actualizadoEn: ahora,
          };
        }
        return t;
      })
    );

    showToast(`Estado actualizado en ${ticketsIds.length} tickets`, 'exito');
  };

  const agregarMensaje = (ticketId: string, cuerpo: string, interno: boolean, adjuntos?: Adjunto[]) => {
    if (!currentUser) return;
    const ahora = new Date().toISOString();

    const nuevoMensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      ticketId,
      autorId: currentUser.id,
      autorNombre: `${currentUser.nombre} ${currentUser.apellidos}`,
      autorRol: currentUser.rol,
      cuerpo,
      interno,
      adjuntos: adjuntos || [],
      creadoEn: ahora,
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      const updates: Partial<Ticket> = { actualizadoEn: ahora };
      
      // If it is first response from SFS agent
      if (!interno && currentUser.rol !== 'cliente' && !ticket.primeraRespuestaEn) {
        updates.primeraRespuestaEn = ahora;
        updates.slaPrimeraRespuestaCumplido = new Date(ahora) <= new Date(ticket.slaPrimeraRespuestaVence);
      }

      // If client responds and status was 'en_espera_cliente', advance to 'en_progreso'
      if (currentUser.rol === 'cliente' && ticket.estado === 'en_espera_cliente') {
        updates.estado = 'en_progreso';
      }

      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)));

      // Event
      setEventos((prev) => [
        ...prev,
        {
          id: `evt-${Date.now()}`,
          ticketId,
          tipo: interno ? 'nota_interna' : 'respuesta_cliente',
          descripcion: interno
            ? `Nota interna añadida por ${currentUser.nombre} ${currentUser.apellidos}`
            : `Respuesta publicada por ${currentUser.nombre} ${currentUser.apellidos}`,
          usuarioId: currentUser.id,
          usuarioNombre: `${currentUser.nombre} ${currentUser.apellidos}`,
          creadoEn: ahora,
        },
      ]);

      // Notify other party
      if (!interno) {
        const empresaTicket = empresas.find((e) => e.id === ticket.empresaId);
        const destinatario = currentUser.rol === 'cliente'
          ? (ticket.asignadoAId
              ? usuarios.find((u) => u.id === ticket.asignadoAId)
              : usuarios.find((u) => u.rol === 'supervisor' || u.rol === 'admin'))
          : usuarios.find((u) => u.id === ticket.creadoPorId);

        if (destinatario) {
          servicioNotificaciones
            .despacharEventoRespuesta({
              ticket,
              remitente: currentUser,
              destinatario,
              esNotaInterna: false,
              cuerpoMensaje: cuerpo,
              nombreEmpresa: empresaTicket?.nombre,
            })
            .then(({ notificaciones: nuevasNotifs }) => {
              if (nuevasNotifs.length > 0) {
                setNotificaciones((prev) => [...nuevasNotifs, ...prev]);
              }
            })
            .catch((err) => console.error('Error despachando respuesta:', err));
        }
      }
    }

    showToast(interno ? 'Nota interna guardada (confidencial SFS)' : 'Respuesta enviada al cliente', 'exito');
  };

  const calificarTicket = (ticketId: string, estrellas: number, comentario?: string) => {
    const ahora = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            calificacion: { estrellas, comentario, fecha: ahora },
            actualizadoEn: ahora,
          };
        }
        return t;
      })
    );

    setEventos((prev) => [
      ...prev,
      {
        id: `evt-${Date.now()}`,
        ticketId,
        tipo: 'calificacion',
        descripcion: `Encuesta CSAT respondida con ${estrellas} estrellas ★`,
        usuarioId: currentUser?.id || 'cli',
        usuarioNombre: currentUser ? `${currentUser.nombre} ${currentUser.apellidos}` : 'Cliente',
        creadoEn: ahora,
      },
    ]);

    showToast('¡Gracias por calificar nuestra atención!', 'exito');
  };

  const reabrirTicket = (ticketId: string, motivo: string) => {
    const ahora = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, estado: 'en_progreso', actualizadoEn: ahora } : t))
    );

    agregarMensaje(ticketId, `[REAPERTURA DE CASO]\nMotivo: ${motivo}`, false);

    setEventos((prev) => [
      ...prev,
      {
        id: `evt-${Date.now()}`,
        ticketId,
        tipo: 'reapertura',
        descripcion: `Ticket reabierto por el cliente: "${motivo}"`,
        usuarioId: currentUser?.id || 'cli',
        usuarioNombre: currentUser ? `${currentUser.nombre} ${currentUser.apellidos}` : 'Cliente',
        creadoEn: ahora,
      },
    ]);

    showToast('Ticket reabierto para revisión del equipo', 'advertencia');
  };

  const crearAnuncio = (datos: Omit<Anuncio, 'id' | 'enviados' | 'leidos' | 'creadoEn'>) => {
    const ahora = new Date().toISOString();
    const id = `anu-${Date.now()}`;

    // Determinar destinatarios según la segmentación
    let destinatarios: Usuario[] = [];
    if (datos.audiencia === 'todas') {
      destinatarios = usuarios.filter((u) => u.rol === 'cliente');
    } else if (datos.audiencia === 'empresas_seleccionadas' && datos.empresasIds) {
      destinatarios = usuarios.filter(
        (u) => u.rol === 'cliente' && u.empresaId && datos.empresasIds?.includes(u.empresaId)
      );
    } else if (datos.audiencia === 'por_rol' && datos.rolesDestino) {
      destinatarios = usuarios.filter((u) => datos.rolesDestino?.includes(u.rol));
    } else {
      destinatarios = usuarios.filter((u) => u.rol === 'cliente');
    }

    const nuevoAnuncio: Anuncio = {
      ...datos,
      id,
      enviados: destinatarios.length,
      leidos: 0,
      creadoEn: ahora,
    };

    setAnuncios((prev) => [nuevoAnuncio, ...prev]);

    // Despachar a través del servicio integrado de notificaciones
    servicioNotificaciones
      .despacharEventoAnuncio({
        anuncio: nuevoAnuncio,
        destinatarios,
      })
      .then(({ notificaciones: nuevasNotifs }) => {
        if (nuevasNotifs.length > 0) {
          setNotificaciones((prev) => [...nuevasNotifs, ...prev]);
        }
      })
      .catch((err) => console.error('Error despachando anuncio:', err));

    showToast('Anuncio publicado a los clientes', 'exito');
  };

  const eliminarAnuncio = (id: string) => {
    setAnuncios((prev) => prev.filter((a) => a.id !== id));
    showToast('Anuncio retirado', 'info');
  };

  const guardarEmpresa = (empresa: Empresa) => {
    setEmpresas((prev) => {
      const existe = prev.some((e) => e.id === empresa.id);
      if (existe) {
        return prev.map((e) => (e.id === empresa.id ? empresa : e));
      }
      return [...prev, empresa];
    });
    showToast(`Empresa "${empresa.nombre}" guardada`, 'exito');
  };

  const guardarUsuario = (usuario: Usuario) => {
    setUsuarios((prev) => {
      const existe = prev.some((u) => u.id === usuario.id);
      if (existe) {
        return prev.map((u) => (u.id === usuario.id ? usuario : u));
      }
      return [...prev, usuario];
    });
    showToast(`Usuario "${usuario.nombre} ${usuario.apellidos}" guardado`, 'exito');
  };

  const eliminarUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    showToast('Usuario eliminado del sistema', 'info');
  };

  const guardarConfiguracion = (nuevaConfig: ConfiguracionSistema) => {
    setConfig(nuevaConfig);
    try {
      localStorage.setItem('sfs_config_data', JSON.stringify(nuevaConfig));
    } catch {}
    showToast('Configuración del sistema actualizada', 'exito');
  };

  const guardarReglasSla = (reglas: ReglaSLA[]) => {
    setReglasSla(reglas);
    try {
      localStorage.setItem('sfs_sla_rules', JSON.stringify(reglas));
    } catch {}
    showToast('Tiempos de SLA actualizados', 'exito');
  };

  const guardarMacros = (nuevosMacros: MacroRespuesta[]) => {
    setMacros(nuevosMacros);
    try {
      localStorage.setItem('sfs_macros_data', JSON.stringify(nuevosMacros));
    } catch {}
    showToast('Plantillas y macros actualizados', 'exito');
  };

  const marcarNotificacionLeida = (id: string) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  };

  const marcarTodasNotificacionesLeidas = () => {
    if (!currentUser) return;
    setNotificaciones((prev) =>
      prev.map((n) => (n.usuarioId === currentUser.id ? { ...n, leida: true } : n))
    );
    showToast('Todas las notificaciones marcadas como leídas', 'info');
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  const limpiarNotificacionesLeidas = () => {
    if (!currentUser) return;
    setNotificaciones((prev) =>
      prev.filter((n) => !(n.usuarioId === currentUser.id && n.leida))
    );
    showToast('Notificaciones leídas eliminadas', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        cambiarUsuarioSimulado,
        cerrarSesion,
        currentPath,
        navigate,
        darkMode,
        toggleDarkMode,
        tickets,
        mensajes,
        eventos,
        empresas,
        usuarios,
        anuncios,
        notificaciones,
        notificacionesAbiertas,
        setNotificacionesAbiertas,
        abrirNotificaciones,
        cerrarNotificaciones,
        reglasSla,
        macros,
        config,
        crearTicket,
        actualizarTicket,
        asignarTicket,
        cambiarEstadoTicket,
        asignarEnLote,
        cambiarEstadoEnLote,
        agregarMensaje,
        calificarTicket,
        reabrirTicket,
        crearAnuncio,
        eliminarAnuncio,
        guardarEmpresa,
        guardarUsuario,
        eliminarUsuario,
        guardarConfiguracion,
        guardarReglasSla,
        guardarMacros,
        marcarNotificacionLeida,
        marcarTodasNotificacionesLeidas,
        eliminarNotificacion,
        limpiarNotificacionesLeidas,
        correosSimulados,
        limpiarCorreosSimulados,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};
