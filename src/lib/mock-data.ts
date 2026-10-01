import { 
  Empresa, 
  Usuario, 
  Ticket, 
  Mensaje, 
  EventoTicket, 
  Anuncio, 
  ReglaSLA, 
  MacroRespuesta, 
  ConfiguracionSistema,
  Notificacion 
} from '../types';

export const REGLAS_SLA_DEFAULT: ReglaSLA[] = [
  {
    prioridad: 'critica',
    nombre: 'Prioridad Crítica (Caída total / DIAN bloqueante)',
    primeraRespuestaHoras: 1,
    solucionHoras: 4,
    descripcion: 'Afecta la operación central del cliente o despacho internacional sin alternativa de contingencia.',
  },
  {
    prioridad: 'alta',
    nombre: 'Prioridad Alta (Impacto severo)',
    primeraRespuestaHoras: 4,
    solucionHoras: 24,
    descripcion: 'Módulo vital afectado pero existe contingencia temporal.',
  },
  {
    prioridad: 'media',
    nombre: 'Prioridad Media (Operación regular)',
    primeraRespuestaHoras: 8,
    solucionHoras: 72,
    descripcion: 'Consultas de uso, reportes secundarios, inconsistencia menor de interfaz.',
  },
  {
    prioridad: 'baja',
    nombre: 'Prioridad Baja (Mejora o cambio menor)',
    primeraRespuestaHoras: 24,
    solucionHoras: 120,
    descripcion: 'Ajuste cosmético, sugerencias o parametrización no urgente.',
  },
];

export const CONFIG_SISTEMA_DEFAULT: ConfiguracionSistema = {
  horarioHabilInicio: '08:00',
  horarioHabilFin: '18:00',
  diasHabiles: [1, 2, 3, 4, 5], // Lunes a Viernes
  zonaHoraria: 'America/Bogota',
  reglaAsignacion: 'round_robin',
  notificarPorCorreo: true,
};

export const MOCK_EMPRESAS: Empresa[] = [
  {
    id: 'emp-1',
    nombre: 'Trilladora y Exportadora La Bastilla S.A.S.',
    nit: '900.342.189-4',
    ciudad: 'Armenia',
    departamento: 'Quindío',
    direccion: 'Zona Industrial Km 4 Vía La Tebaida',
    telefono: '+57 (606) 745-8900',
    emailContacto: 'soporte.sistemas@labastilla.com.co',
    planSoporte: 'Platinum Empresa',
    activo: true,
    creadoEn: '2023-01-15T08:00:00-05:00',
    ticketsAbiertos: 4,
    totalTicketsHistorico: 24,
  },
  {
    id: 'emp-2',
    nombre: 'Café Pergamino Especiales de Origen',
    nit: '901.120.450-8',
    ciudad: 'Medellín',
    departamento: 'Antioquia',
    direccion: 'Carrera 37 # 8A - 37, El Poblado',
    telefono: '+57 (604) 448-1290',
    emailContacto: 'tecnologia@pergaminocafe.co',
    planSoporte: 'Gold 24/7',
    activo: true,
    creadoEn: '2023-03-20T09:00:00-05:00',
    ticketsAbiertos: 3,
    totalTicketsHistorico: 31,
  },
  {
    id: 'emp-3',
    nombre: 'Cooperativa Cafetera de los Andes (CapAndes)',
    nit: '890.901.423-1',
    ciudad: 'Andes',
    departamento: 'Antioquia',
    direccion: 'Calle 50 # 51-24, Parque Principal',
    telefono: '+57 (604) 841-4500',
    emailContacto: 'sistemas@capandes.com.co',
    planSoporte: 'Platinum Empresa',
    activo: true,
    creadoEn: '2022-11-10T08:30:00-05:00',
    ticketsAbiertos: 5,
    totalTicketsHistorico: 42,
  },
  {
    id: 'emp-4',
    nombre: 'Trilladora Café Real de Colombia',
    nit: '800.781.992-3',
    ciudad: 'Manizales',
    departamento: 'Caldas',
    direccion: 'Calle 10 # 23-45, Barrio Milán',
    telefono: '+57 (606) 887-3200',
    emailContacto: 'operaciones@caferealcolombia.com',
    planSoporte: 'Standard Pyme',
    activo: true,
    creadoEn: '2024-02-01T10:00:00-05:00',
    ticketsAbiertos: 2,
    totalTicketsHistorico: 18,
  },
];

export const MOCK_USUARIOS: Usuario[] = [
  // Super Admin / Supervisor SFS
  {
    id: 'usr-sfs-1',
    nombre: 'Mariana',
    apellidos: 'Salazar Restrepo',
    email: 'mariana.salazar@sfs.com.co',
    rol: 'supervisor',
    cargo: 'Líder de Soporte y Éxito de Clientes SFS',
    telefono: '+57 311 845 2290',
    activo: true,
    creadoEn: '2022-01-10T08:00:00-05:00',
    ultimoAcceso: '2026-10-01T15:45:00-05:00',
  },
  // Agentes SFS
  {
    id: 'usr-sfs-2',
    nombre: 'Carlos',
    apellidos: 'Gómez Henao',
    email: 'carlos.gomez@sfs.com.co',
    rol: 'agente',
    cargo: 'Ingeniero Especialista ERP & Trilla',
    telefono: '+57 300 671 9023',
    activo: true,
    creadoEn: '2022-05-15T08:00:00-05:00',
    ultimoAcceso: '2026-10-01T16:10:00-05:00',
  },
  {
    id: 'usr-sfs-3',
    nombre: 'Valentina',
    apellidos: 'Ríos Castañeda',
    email: 'valentina.rios@sfs.com.co',
    rol: 'agente',
    cargo: 'Especialista Facturación DIAN & Exportaciones',
    telefono: '+57 312 901 3411',
    activo: true,
    creadoEn: '2023-02-01T08:00:00-05:00',
    ultimoAcceso: '2026-10-01T14:30:00-05:00',
  },
  {
    id: 'usr-sfs-4',
    nombre: 'Mateo',
    apellidos: 'Jaramillo Osorio',
    email: 'mateo.jaramillo@sfs.com.co',
    rol: 'agente',
    cargo: 'Ingeniero de Soporte Nivel 1 & Accesos',
    telefono: '+57 315 444 8922',
    activo: true,
    creadoEn: '2023-08-10T08:00:00-05:00',
    ultimoAcceso: '2026-10-01T16:05:00-05:00',
  },
  {
    id: 'usr-sfs-5',
    nombre: 'Andrea',
    apellidos: 'Cifuentes Duque',
    email: 'andrea.cifuentes@sfs.com.co',
    rol: 'agente',
    cargo: 'Ingeniera de Calidad & Procesos Cafeteros',
    telefono: '+57 320 551 7890',
    activo: true,
    creadoEn: '2024-01-15T08:00:00-05:00',
    ultimoAcceso: '2026-10-01T15:20:00-05:00',
  },
  // Administrador de Sistema SFS
  {
    id: 'usr-sfs-admin',
    nombre: 'Andrés Felipe',
    apellidos: 'Vargas Toro',
    email: 'andres.vargas@sfs.com.co',
    rol: 'admin',
    cargo: 'Director de Tecnología e Infraestructura SFS',
    telefono: '+57 310 998 1234',
    activo: true,
    creadoEn: '2021-06-01T08:00:00-05:00',
    ultimoAcceso: '2026-10-01T11:00:00-05:00',
  },
  // Usuarios Clientes
  {
    id: 'usr-cli-1',
    nombre: 'Santiago',
    apellidos: 'Ochoa Pineda',
    email: 'santiago.ochoa@labastilla.com.co',
    rol: 'cliente',
    cargo: 'Director de Operaciones y Trilla',
    empresaId: 'emp-1',
    telefono: '+57 314 780 1256',
    activo: true,
    creadoEn: '2023-01-20T10:00:00-05:00',
    ultimoAcceso: '2026-10-01T16:00:00-05:00',
  },
  {
    id: 'usr-cli-2',
    nombre: 'Camila',
    apellidos: 'Arango Vélez',
    email: 'camila.arango@pergaminocafe.co',
    rol: 'cliente',
    cargo: 'Gerente de Cadena de Suministro y TI',
    empresaId: 'emp-2',
    telefono: '+57 301 234 5678',
    activo: true,
    creadoEn: '2023-04-10T11:00:00-05:00',
    ultimoAcceso: '2026-10-01T15:30:00-05:00',
  },
  {
    id: 'usr-cli-3',
    nombre: 'Jorge',
    apellidos: 'Hernández Bedoya',
    email: 'jorge.hernandez@capandes.com.co',
    rol: 'cliente',
    cargo: 'Coordinador de Facturación y Liquidación Caficultores',
    empresaId: 'emp-3',
    telefono: '+57 313 678 9012',
    activo: true,
    creadoEn: '2022-12-01T09:00:00-05:00',
    ultimoAcceso: '2026-10-01T14:45:00-05:00',
  },
  {
    id: 'usr-cli-4',
    nombre: 'Patricia',
    apellidos: 'Grisales Muñoz',
    email: 'patricia.grisales@caferealcolombia.com',
    rol: 'cliente',
    cargo: 'Jefe de Logística de Exportación',
    empresaId: 'emp-4',
    telefono: '+57 317 890 1234',
    activo: true,
    creadoEn: '2024-02-15T08:30:00-05:00',
    ultimoAcceso: '2026-10-01T12:15:00-05:00',
  },
];

export const MOCK_MACROS: MacroRespuesta[] = [
  {
    id: 'mac-1',
    titulo: 'Solicitud de evidencia y logs DIAN',
    atajo: '/dian-logs',
    categoria: 'reportes_dian',
    contenido: 'Estimado/a {cliente},\n\nPara poder depurar la inconsistencia en el timbrado ante la DIAN, le solicitamos amablemente adjuntar el archivo XML generado y la captura del error en pantalla. Nuestro equipo de integración revisará el WebService inmediatamente.',
  },
  {
    id: 'mac-2',
    titulo: 'Pase a producción / Despliegue completado',
    atajo: '/solucionado',
    categoria: 'general',
    contenido: 'Hola {cliente},\n\nLe confirmamos que el ajuste solicitado ha sido verificado en pruebas y desplegado en su servidor. Por favor valide el funcionamiento e indíquenos si requiere algún acompañamiento adicional.',
  },
  {
    id: 'mac-3',
    titulo: 'Reinicio de sesión y caché de navegador',
    atajo: '/limpiar-cache',
    categoria: 'acceso_usuarios',
    contenido: 'Estimado/a {cliente},\n\nTras la actualización del aplicativo, le recomendamos cerrar sesión, presionar Ctrl + F5 (o Cmd + Shift + R) para refrescar los componentes estáticos y volver a ingresar con sus credenciales institucionales.',
  },
  {
    id: 'mac-4',
    titulo: 'SLA - Escalado a Nivel 3 (Desarrollo Central)',
    atajo: '/escalar-n3',
    categoria: 'error_sistema',
    contenido: 'Estimado cliente,\n\nEl presente caso ha sido diagnosticado y derivado al equipo de ingeniería de producto SFS (Nivel 3). Estamos monitoreando activamente el ticket para asegurar el cumplimiento del tiempo pactado en su plan de soporte.',
  },
];

export const MOCK_ANUNCIOS: Anuncio[] = [
  {
    id: 'anu-1',
    titulo: 'Mantenimiento Preventivo de Servidores de Nube SFS Cloud',
    cuerpo: '<p>Estimados clientes, les informamos que el próximo <strong>Sábado 10 de Octubre de 10:00 PM a 02:00 AM (hora Colombia)</strong> realizaremos una ventana de mantenimiento programado en nuestra infraestructura de base de datos. Los módulos de sincronización estarán temporalmente en modo contingencia.</p>',
    tipo: 'mantenimiento',
    audiencia: 'todas',
    canales: 'ambos',
    publicarEn: '2026-10-01T08:00:00-05:00',
    expiraEn: '2026-10-11T23:59:59-05:00',
    fijado: true,
    estado: 'publicado',
    enviados: 48,
    leidos: 39,
    creadoPorId: 'usr-sfs-1',
    creadoEn: '2026-10-01T08:00:00-05:00',
  },
  {
    id: 'anu-2',
    titulo: 'Nueva Resolución DIAN 2026: Actualización obligatoria de catálogos de café',
    cuerpo: '<p>Ya se encuentra disponible el nuevo paquete de actualización v4.3 del ERP SFS Trilla con soporte para la nueva tabla de tarifas de retención en la fuente y timbrado de Guías de Tránsito de Café de la FNC.</p>',
    tipo: 'novedad',
    audiencia: 'todas',
    canales: 'banner',
    publicarEn: '2026-09-25T09:00:00-05:00',
    expiraEn: '2026-10-25T18:00:00-05:00',
    fijado: false,
    estado: 'publicado',
    enviados: 48,
    leidos: 44,
    creadoPorId: 'usr-sfs-admin',
    creadoEn: '2026-09-25T09:00:00-05:00',
  },
  {
    id: 'anu-3',
    titulo: 'Incidencia mitigada: WebService de Validación Previa DIAN',
    cuerpo: '<p>La DIAN reportó estabilidad recuperada en su nodo de recepción de comprobantes electrónicos a las 11:30 AM. La cola de documentos represados en SFS ERP ya se procesó al 100%.</p>',
    tipo: 'incidente',
    audiencia: 'todas',
    canales: 'ambos',
    publicarEn: '2026-09-28T11:45:00-05:00',
    expiraEn: '2026-09-30T23:59:59-05:00',
    fijado: false,
    estado: 'expirado',
    enviados: 52,
    leidos: 50,
    creadoPorId: 'usr-sfs-3',
    creadoEn: '2026-09-28T11:45:00-05:00',
  },
];

// Helper to generate tickets realistically across past 90 days
function generarTicketsMock(): { tickets: Ticket[]; mensajes: Mensaje[]; eventos: EventoTicket[] } {
  const tickets: Ticket[] = [];
  const mensajes: Mensaje[] = [];
  const eventos: EventoTicket[] = [];

  const temas = [
    {
      asunto: 'Error 500 al timbrar factura electrónica DIAN por código CUFE no generado',
      cat: 'reportes_dian' as const,
      mod: 'Facturación Electrónica DIAN' as const,
      prio: 'critica' as const,
      desc: 'Al emitir el lote de facturas de exportación para la naviera Maersk, el sistema arroja excepción de tiempo de espera en el token del WebService DIAN.',
    },
    {
      asunto: 'Diferencia en liquidación de rendimiento de trilla de café pergamino seco',
      cat: 'error_sistema' as const,
      mod: 'ERP SFS Trilla' as const,
      prio: 'alta' as const,
      desc: 'El factor de rendimiento reporta 92.4 kg cuando el pesaje en báscula electrónica arrojó 94.1 kg. Los caficultores están esperando el comprobante.',
    },
    {
      asunto: 'No genera certificado de origen OIC para exportación a Hamburgo',
      cat: 'error_sistema' as const,
      mod: 'Exportaciones & Logística' as const,
      prio: 'alta' as const,
      desc: 'El botón de exportar PDF del certificado OIC de la Organización Internacional del Café sale en blanco cuando el lote supera 250 sacos de 70kg.',
    },
    {
      asunto: 'Creación de nuevo usuario para auxiliar de báscula y catación',
      cat: 'acceso_usuarios' as const,
      mod: 'Seguridad & Accesos' as const,
      prio: 'media' as const,
      desc: 'Solicitamos habilitar usuario para Pedro Pablo Montoya en la sede de recepción de café pergamino con permisos de ingreso de humedad y defectos.',
    },
    {
      asunto: 'Duda sobre parametrización de humedad máxima en recepción de café',
      cat: 'duda_uso' as const,
      mod: 'Control de Calidad & Catación' as const,
      prio: 'baja' as const,
      desc: 'Requerimos ajustar el umbral de alerta de humedad del 12% al 11.5% para la cosecha mitaca. ¿En qué módulo se configura la regla?',
    },
    {
      asunto: 'Solicitud de adición de campo "Vereda / Finca de Origen" en comprobante de ingreso',
      cat: 'solicitud_cambio' as const,
      mod: 'Portal de Proveedores y Caficultores' as const,
      prio: 'media' as const,
      desc: 'Para trazabilidad de cafés especiales de taza limpia necesitamos que se imprima la finca en el tiquete térmico de báscula.',
    },
    {
      asunto: 'Lentitud intermitente al consultar histórico de compras a caficultores',
      cat: 'error_sistema' as const,
      mod: 'Portal de Proveedores y Caficultores' as const,
      prio: 'media' as const,
      desc: 'La pantalla de consulta se queda cargando cuando el rango de fechas incluye más de 12 meses. Requiere optimización de índice.',
    },
    {
      asunto: 'Falla al sincronizar inventario de silos con módulo de trillado continuo',
      cat: 'error_sistema' as const,
      mod: 'Inventarios & Almacén' as const,
      prio: 'critica' as const,
      desc: 'El sensor Modbus del silo 3 no actualiza el stock en tiempo real en la pantalla de control de planta. Se detuvo la línea 2 de trilla.',
    },
    {
      asunto: 'Solicitud de capacitación para nuevo personal del laboratorio de catación SCA',
      cat: 'duda_uso' as const,
      mod: 'Control de Calidad & Catación' as const,
      prio: 'baja' as const,
      desc: 'Ingresaron 3 catadores nuevos y deseamos agendar una sesión virtual de 45 minutos para repasar la ficha electrónica de puntaje SCA.',
    },
    {
      asunto: 'Error en cálculo de retención en la fuente 0.5% compras de café',
      cat: 'reportes_dian' as const,
      mod: 'Facturación Electrónica DIAN' as const,
      prio: 'alta' as const,
      desc: 'El sistema no aplicó la base especial exenta estipulada para compras menores a caficultores del régimen simple.',
    },
  ];

  const empresasIds = ['emp-1', 'emp-2', 'emp-3', 'emp-4'];
  const agentesIds = ['usr-sfs-2', 'usr-sfs-3', 'usr-sfs-4', 'usr-sfs-5', 'usr-sfs-1'];
  const estadosPosibles: { [key: string]: number } = {
    nuevo: 6,
    asignado: 8,
    en_progreso: 12,
    en_espera_cliente: 7,
    resuelto: 18,
    cerrado: 14,
  };

  let ticketCounter = 1001;
  const now = new Date('2026-10-01T16:20:00-05:00').getTime();

  // Generate 65 tickets
  let itemIndex = 0;
  for (const [estado, count] of Object.entries(estadosPosibles)) {
    for (let i = 0; i < count; i++) {
      const id = `tkt-${ticketCounter}`;
      const numero = `#SFS-${ticketCounter}`;
      const tema = temas[itemIndex % temas.length];
      const empId = empresasIds[itemIndex % empresasIds.length];
      
      // Determine requester
      let creadorId = 'usr-cli-1';
      if (empId === 'emp-2') creadorId = 'usr-cli-2';
      if (empId === 'emp-3') creadorId = 'usr-cli-3';
      if (empId === 'emp-4') creadorId = 'usr-cli-4';

      const asignadoId = estado === 'nuevo' ? null : agentesIds[itemIndex % agentesIds.length];

      // Age in days (0 to 88)
      const diasAtras = (itemIndex * 1.35) % 88;
      const creadoDate = new Date(now - diasAtras * 24 * 3600 * 1000 - (itemIndex * 37 * 60 * 1000));
      
      // SLA bounds
      let respHours = 8;
      let solHours = 72;
      if (tema.prio === 'critica') { respHours = 1; solHours = 4; }
      else if (tema.prio === 'alta') { respHours = 4; solHours = 24; }
      else if (tema.prio === 'baja') { respHours = 24; solHours = 120; }

      const slaRespDate = new Date(creadoDate.getTime() + respHours * 3600 * 1000);
      const slaSolDate = new Date(creadoDate.getTime() + solHours * 3600 * 1000);

      let primeraRespuestaEn: string | undefined = undefined;
      let resueltoEn: string | undefined = undefined;
      let cerradoEn: string | undefined = undefined;
      let calificacion = undefined;

      const isResolved = estado === 'resuelto' || estado === 'cerrado';
      if (estado !== 'nuevo') {
        // Did answer
        const answeredAfterMins = (respHours * 0.6 * 60) + (itemIndex % 20);
        primeraRespuestaEn = new Date(creadoDate.getTime() + answeredAfterMins * 60 * 1000).toISOString();
      }

      if (isResolved) {
        const solvedAfterHours = Math.max(1, solHours * (0.5 + (itemIndex % 4) * 0.15));
        resueltoEn = new Date(creadoDate.getTime() + solvedAfterHours * 3600 * 1000).toISOString();
        if (estado === 'cerrado') {
          cerradoEn = new Date(new Date(resueltoEn).getTime() + 48 * 3600 * 1000).toISOString();
        }
        // Rating
        const estrellasArray = [5, 5, 4, 5, 4, 3, 5, 5];
        const estrella = estrellasArray[itemIndex % estrellasArray.length];
        calificacion = {
          estrellas: estrella,
          comentario: estrella >= 4 
            ? 'Excelente atención por parte del equipo SFS, resolvieron a tiempo y pudimos despachar sin retrasos.'
            : 'Atendido dentro del tiempo, gracias por el soporte.',
          fecha: resueltoEn,
        };
      }

      const ticket: Ticket = {
        id,
        numero,
        asunto: `${tema.asunto} ${itemIndex > 10 ? `(Lote #${100 + itemIndex})` : ''}`,
        descripcion: tema.desc,
        categoria: tema.cat,
        modulo: tema.mod,
        prioridad: tema.prio,
        estado: estado as any,
        empresaId: empId,
        creadoPorId: creadorId,
        asignadoAId: asignadoId,
        etiquetas: ['Café', tema.mod.split(' ')[0], tema.prio.toUpperCase()],
        slaPrimeraRespuestaVence: slaRespDate.toISOString(),
        slaSolucionVence: slaSolDate.toISOString(),
        primeraRespuestaEn,
        resueltoEn,
        cerradoEn,
        creadoEn: creadoDate.toISOString(),
        actualizadoEn: isResolved && resueltoEn ? resueltoEn : new Date(creadoDate.getTime() + 2 * 3600 * 1000).toISOString(),
        calificacion,
        slaPrimeraRespuestaCumplido: primeraRespuestaEn ? new Date(primeraRespuestaEn) <= slaRespDate : undefined,
        slaSolucionCumplido: resueltoEn ? new Date(resueltoEn) <= slaSolDate : undefined,
      };

      tickets.push(ticket);

      // Eventos e hilos
      eventos.push({
        id: `evt-${ticketCounter}-1`,
        ticketId: id,
        tipo: 'creacion',
        descripcion: `Ticket reportado por el cliente con prioridad ${ticket.prioridad}`,
        usuarioId: creadorId,
        usuarioNombre: empId === 'emp-1' ? 'Santiago Ochoa' : empId === 'emp-2' ? 'Camila Arango' : 'Jorge Hernández',
        creadoEn: ticket.creadoEn,
      });

      // Primer mensaje (del cliente)
      mensajes.push({
        id: `msg-${ticketCounter}-1`,
        ticketId: id,
        autorId: creadorId,
        autorNombre: empId === 'emp-1' ? 'Santiago Ochoa' : empId === 'emp-2' ? 'Camila Arango' : 'Jorge Hernández',
        autorRol: 'cliente',
        autorEmpresa: empId === 'emp-1' ? 'La Bastilla S.A.S.' : empId === 'emp-2' ? 'Café Pergamino' : 'CapAndes',
        cuerpo: ticket.descripcion,
        interno: false,
        adjuntos: itemIndex % 3 === 0 ? [
          {
            id: `adj-${ticketCounter}-1`,
            nombre: 'captura_error_sistema_pantalla.png',
            tamanoBytes: 245000,
            tipoMime: 'image/png',
            url: '#',
          }
        ] : [],
        creadoEn: ticket.creadoEn,
      });

      if (asignadoId) {
        eventos.push({
          id: `evt-${ticketCounter}-2`,
          ticketId: id,
          tipo: 'cambio_asignado',
          descripcion: `Ticket asignado a especialista SFS`,
          usuarioId: 'usr-sfs-1',
          usuarioNombre: 'Mariana Salazar',
          creadoEn: new Date(creadoDate.getTime() + 15 * 60 * 1000).toISOString(),
        });

        // Nota interna de soporte
        mensajes.push({
          id: `msg-${ticketCounter}-int`,
          ticketId: id,
          autorId: asignadoId,
          autorNombre: asignadoId === 'usr-sfs-2' ? 'Carlos Gómez' : asignadoId === 'usr-sfs-3' ? 'Valentina Ríos' : 'Mariana Salazar',
          autorRol: 'agente',
          cuerpo: 'Nota interna SFS: Revisando logs en la base de datos de producción. La conexión con la báscula/DIAN fue validada. Se procede a ejecutar procedimiento correctivo.',
          interno: true,
          adjuntos: [],
          creadoEn: new Date(creadoDate.getTime() + 25 * 60 * 1000).toISOString(),
        });

        // Respuesta pública al cliente
        mensajes.push({
          id: `msg-${ticketCounter}-resp`,
          ticketId: id,
          autorId: asignadoId,
          autorNombre: asignadoId === 'usr-sfs-2' ? 'Carlos Gómez' : asignadoId === 'usr-sfs-3' ? 'Valentina Ríos' : 'Mariana Salazar',
          autorRol: 'agente',
          cuerpo: 'Estimado cliente,\n\nHemos recibido su reporte y nuestro equipo especializado está interviniendo la plataforma para garantizar la continuidad de sus operaciones de trilla y despacho. Le mantendremos informado en este mismo hilo.',
          interno: false,
          adjuntos: [],
          creadoEn: new Date(creadoDate.getTime() + 35 * 60 * 1000).toISOString(),
        });
      }

      if (isResolved) {
        eventos.push({
          id: `evt-${ticketCounter}-3`,
          ticketId: id,
          tipo: 'cambio_estado',
          descripcion: 'Ticket marcado como RESUELTO por el equipo de soporte SFS',
          usuarioId: asignadoId || 'usr-sfs-1',
          usuarioNombre: 'Carlos Gómez',
          creadoEn: resueltoEn!,
        });

        mensajes.push({
          id: `msg-${ticketCounter}-sol`,
          ticketId: id,
          autorId: asignadoId || 'usr-sfs-1',
          autorNombre: 'Carlos Gómez',
          autorRol: 'agente',
          cuerpo: 'Estimado cliente,\n\nLe confirmamos que el caso ha quedado solventado a conformidad. Las pruebas de integración se completaron exitosamente y el servicio opera con normalidad. Agradecemos su confirmación y calificación del servicio.',
          interno: false,
          adjuntos: [],
          creadoEn: resueltoEn!,
        });
      }

      ticketCounter++;
      itemIndex++;
    }
  }

  return { tickets, mensajes, eventos };
}

const mockGenerado = generarTicketsMock();
export const MOCK_TICKETS: Ticket[] = mockGenerado.tickets;
export const MOCK_MENSAJES: Mensaje[] = mockGenerado.mensajes;
export const MOCK_EVENTOS: EventoTicket[] = mockGenerado.eventos;

export const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id: 'notif-1',
    usuarioId: 'usr-sfs-1',
    titulo: 'Nuevo ticket crítico reportado',
    mensaje: 'Trilladora La Bastilla reportó #SFS-1001: Error 500 al timbrar factura electrónica DIAN',
    tipo: 'ticket_nuevo',
    ticketId: 'tkt-1001',
    leida: false,
    creadaEn: '2026-10-01T15:30:00-05:00',
  },
  {
    id: 'notif-2',
    usuarioId: 'usr-sfs-2',
    titulo: 'Ticket asignado a tu bandeja',
    mensaje: 'Se te asignó el ticket #SFS-1002 de Café Pergamino',
    tipo: 'ticket_asignado',
    ticketId: 'tkt-1002',
    leida: false,
    creadaEn: '2026-10-01T14:15:00-05:00',
  },
  {
    id: 'notif-3',
    usuarioId: 'usr-cli-1',
    titulo: 'Respuesta de soporte SFS',
    mensaje: 'Carlos Gómez respondió a tu ticket #SFS-1001',
    tipo: 'nueva_respuesta',
    ticketId: 'tkt-1001',
    leida: false,
    creadaEn: '2026-10-01T15:45:00-05:00',
  },
  {
    id: 'notif-4',
    usuarioId: 'usr-sfs-1',
    titulo: 'Alerta de SLA por vencer (1 hora)',
    mensaje: 'El ticket #SFS-1008 de CapAndes está a 45 minutos del vencimiento de primera respuesta.',
    tipo: 'sla_vencer',
    ticketId: 'tkt-1008',
    leida: true,
    creadaEn: '2026-10-01T12:00:00-05:00',
  },
];
