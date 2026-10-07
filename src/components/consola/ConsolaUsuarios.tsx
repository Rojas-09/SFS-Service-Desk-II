import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Usuario, RolUsuario } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Building2,
  Mail,
  KeyRound,
  CheckCircle2,
  XCircle,
  X,
  Check,
  Search,
  Pencil,
  Trash2,
  Phone,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { formatoFechaHoraCO } from '../../lib/utils';

export const ConsolaUsuarios: React.FC = () => {
  const { usuarios, empresas, guardarUsuario, eliminarUsuario, showToast } = useApp();

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);

  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [search, setSearch] = useState('');

  // Form states (shared for create/edit)
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<RolUsuario>('cliente');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id || '');
  const [activo, setActivo] = useState(true);
  const [requiereCambioPassword, setRequiereCambioPassword] = useState(true);

  const filteredUsuarios = usuarios.filter((u) => {
    if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = `${u.nombre} ${u.apellidos}`.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchCargo = (u.cargo || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCargo) return false;
    }
    return true;
  });

  // Open Create Modal
  const handleOpenCrear = () => {
    setNombre('');
    setApellidos('');
    setEmail('');
    setRol('cliente');
    setCargo('');
    setTelefono('+57 ');
    setEmpresaId(empresas[0]?.id || '');
    setActivo(true);
    setRequiereCambioPassword(true);
    setModalCrearAbierto(true);
  };

  // Open Edit Modal with user data
  const handleOpenEditar = (u: Usuario) => {
    setUsuarioEditando(u);
    setNombre(u.nombre);
    setApellidos(u.apellidos || '');
    setEmail(u.email);
    setRol(u.rol);
    setCargo(u.cargo || '');
    setTelefono(u.telefono || '+57 ');
    setEmpresaId(u.empresaId || empresas[0]?.id || '');
    setActivo(u.activo);
    setRequiereCambioPassword(u.requiereCambioPassword ?? false);
    setModalEditarAbierto(true);
  };

  // Submit Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      showToast('Por favor completa los campos obligatorios', 'advertencia');
      return;
    }

    const nuevo: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      rol,
      cargo: cargo.trim() || (rol === 'cliente' ? 'Operador de Planta' : 'Especialista SFS'),
      telefono: telefono.trim(),
      empresaId: rol === 'cliente' ? empresaId : undefined,
      activo,
      creadoEn: new Date().toISOString(),
      requiereCambioPassword,
    };

    guardarUsuario(nuevo);
    setModalCrearAbierto(false);
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    if (!nombre.trim() || !email.trim()) {
      showToast('Por favor completa los campos obligatorios', 'advertencia');
      return;
    }

    const usuarioModificado: Usuario = {
      ...usuarioEditando,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      rol,
      cargo: cargo.trim() || (rol === 'cliente' ? 'Operador de Planta' : 'Especialista SFS'),
      telefono: telefono.trim(),
      empresaId: rol === 'cliente' ? empresaId : undefined,
      activo,
      requiereCambioPassword,
    };

    guardarUsuario(usuarioModificado);
    setModalEditarAbierto(false);
    setUsuarioEditando(null);
  };

  // Quick Toggle Active with "X" / Check
  const handleToggleActivo = (u: Usuario) => {
    const nuevoEstado = !u.activo;
    guardarUsuario({ ...u, activo: nuevoEstado });
    showToast(
      nuevoEstado
        ? `Usuario ${u.nombre} ${u.apellidos} activado`
        : `Usuario ${u.nombre} ${u.apellidos} desactivado`,
      nuevoEstado ? 'exito' : 'info'
    );
  };

  const handleResetPassword = (u: Usuario) => {
    guardarUsuario({ ...u, requiereCambioPassword: true });
    showToast(`Se ha enviado enlace de restablecimiento de contraseña a ${u.email}`, 'info');
  };

  const handleConfirmarEliminar = () => {
    if (!usuarioAEliminar) return;
    eliminarUsuario(usuarioAEliminar.id);
    setUsuarioAEliminar(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0B2A5B] dark:text-white tracking-tight flex items-center gap-2">
            <span>Gestión de Usuarios & Accesos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300 font-semibold font-mono tabular-nums">
              {usuarios.length} registrados
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administración completa de cuentas (CRUD), roles corporativos y accesos a la mesa de ayuda
          </p>
        </div>

        <button
          onClick={handleOpenCrear}
          className="px-4 py-2 bg-[#F37021] hover:bg-[#e06114] text-white text-xs md:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs shrink-0 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-[#0E244D] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setFiltroRol('todos')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'todos'
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({usuarios.length})
          </button>
          <button
            onClick={() => setFiltroRol('cliente')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'cliente'
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Clientes ({usuarios.filter((u) => u.rol === 'cliente').length})
          </button>
          <button
            onClick={() => setFiltroRol('agente')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'agente'
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Agentes SFS ({usuarios.filter((u) => u.rol === 'agente').length})
          </button>
          <button
            onClick={() => setFiltroRol('supervisor')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'supervisor'
                ? 'bg-[#1565C0] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Supervisores / TI ({usuarios.filter((u) => u.rol === 'supervisor' || u.rol === 'admin').length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* MOBILE CARDS FEED (< md) */}
      <div className="md:hidden space-y-3">
        {filteredUsuarios.map((u) => {
          const emp = u.empresaId ? empresas.find((e) => e.id === u.empresaId) : null;

          return (
            <div
              key={u.id}
              className="bg-white dark:bg-[#0E244D] p-4 rounded-xl border border-slate-200 dark:border-[#1A3668] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {u.nombre[0]}
                    {u.apellidos ? u.apellidos[0] : ''}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {u.nombre} {u.apellidos}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                  </div>
                </div>

                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                    u.rol === 'cliente'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : u.rol === 'agente'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : u.rol === 'supervisor'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {u.rol}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-[#1A3668]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Organización</span>
                  <span className="truncate block font-medium">
                    {emp ? emp.nombre : 'Software Factory & Services'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Cargo</span>
                  <span className="truncate block">{u.cargo || 'No asignado'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#1A3668] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {u.activo ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 font-semibold text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      Inactivo
                    </span>
                  )}
                </div>

                {/* Compact Actions: Pencil, X/Check, Key, Trash */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditar(u)}
                    className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 text-[#1565C0] dark:text-[#3FA2E8] hover:bg-blue-100 transition active:scale-90"
                    title="Modificar datos del usuario (Editar)"
                    aria-label="Editar usuario"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleResetPassword(u)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A3668] text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition active:scale-90"
                    title="Restablecer contraseña"
                    aria-label="Restablecer contraseña"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>

                  {/* Compact X button instead of the word 'desactivar' */}
                  <button
                    onClick={() => handleToggleActivo(u)}
                    className={`p-1.5 rounded-lg border transition active:scale-90 ${
                      u.activo
                        ? 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/40 text-red-600 hover:bg-red-100'
                        : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                    }`}
                    title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                    aria-label={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    {u.activo ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setUsuarioAEliminar(u)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A3668] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-90"
                    title="Eliminar usuario definitivamente"
                    aria-label="Eliminar usuario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP & TABLET USERS TABLE (>= md) */}
      <div className="hidden md:block bg-white dark:bg-[#0E244D] rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-[#081B3A] text-slate-500 font-semibold border-b border-slate-200 dark:border-[#1A3668]">
              <tr>
                <th className="p-3.5">Usuario</th>
                <th className="p-3.5">Rol</th>
                <th className="p-3.5">Empresa / Organización</th>
                <th className="p-3.5">Cargo</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Último Acceso</th>
                <th className="p-3.5 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1A3668]">
              {filteredUsuarios.map((u) => {
                const emp = u.empresaId ? empresas.find((e) => e.id === u.empresaId) : null;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.nombre[0]}
                          {u.apellidos ? u.apellidos[0] : ''}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {u.nombre} {u.apellidos}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`font-mono text-xs font-bold tracking-wider ${
                          u.rol === 'cliente'
                            ? 'text-blue-600 dark:text-blue-400'
                            : u.rol === 'agente'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : u.rol === 'supervisor'
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {u.rol.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {emp ? (
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{emp.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold truncate block max-w-[170px]">
                          Software Factory & Services
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-500 max-w-[120px] truncate">{u.cargo || '—'}</td>

                    <td className="p-3.5">
                      {u.activo ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {formatoFechaHoraCO(u.ultimoAcceso || u.creadoEn)}
                    </td>

                    {/* ACTIONS: Pencil for modifying all data, X for deactivation, Key for reset, Trash for delete */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Lápiz de modificación de todos los datos */}
                        <button
                          onClick={() => handleOpenEditar(u)}
                          className="p-1.5 text-[#1565C0] dark:text-[#3FA2E8] hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-900/60 transition active:scale-90"
                          title="Modificar todos los datos del usuario (Editar)"
                          aria-label="Editar usuario"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset password */}
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg border border-slate-200 dark:border-[#1A3668] transition active:scale-90"
                          title="Restablecer contraseña"
                          aria-label="Restablecer contraseña"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* X en vez de la palabra 'Desactivar' para optimizar espacio */}
                        <button
                          onClick={() => handleToggleActivo(u)}
                          className={`p-1.5 rounded-lg border transition active:scale-90 ${
                            u.activo
                              ? 'text-red-600 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40'
                              : 'text-emerald-600 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                          title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          aria-label={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {u.activo ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete user */}
                        <button
                          onClick={() => setUsuarioAEliminar(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-slate-200 dark:border-[#1A3668] transition active:scale-90"
                          title="Eliminar usuario"
                          aria-label="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E244D] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A3668]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1565C0]" />
                <h3 className="font-bold text-base text-[#0B2A5B] dark:text-white">
                  Crear / Invitar Nuevo Usuario
                </h3>
              </div>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Carlos"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    placeholder="Restrepo"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@empresa.com.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    placeholder="+57 310 123 4567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Rol en el Sistema *
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolUsuario)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  >
                    <option value="cliente">Cliente (Empresa Cafetera)</option>
                    <option value="agente">Agente SFS</option>
                    <option value="supervisor">Supervisor SFS</option>
                    <option value="admin">Administrador TI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Cargo o Función
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Jefe de Trilla / Ingeniero TI"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              {rol === 'cliente' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Empresa Cliente Asociada *
                  </label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  >
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} (NIT: {e.nit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1A3668]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={requiereCambioPassword}
                    onChange={(e) => setRequiereCambioPassword(e.target.checked)}
                    className="w-4 h-4 text-[#1565C0] rounded"
                  />
                  <span>Exigir cambio de clave al primer ingreso</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Cuenta activa</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1A3668]">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1565C0] hover:bg-[#1976D2] text-white font-bold rounded-xl shadow-xs active:scale-95 transition"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL (LAPÍZ: CRUD UPDATE) */}
      {modalEditarAbierto && usuarioEditando && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E244D] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A3668]">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#F37021]" />
                <div>
                  <h3 className="font-bold text-base text-[#0B2A5B] dark:text-white leading-tight">
                    Modificar Datos de Usuario
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {usuarioEditando.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalEditarAbierto(false);
                  setUsuarioEditando(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Rol en el Sistema *
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolUsuario)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  >
                    <option value="cliente">Cliente (Empresa Cafetera)</option>
                    <option value="agente">Agente SFS</option>
                    <option value="supervisor">Supervisor SFS</option>
                    <option value="admin">Administrador TI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Cargo o Función
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>

              {rol === 'cliente' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Empresa Cliente Asociada
                  </label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0]"
                  >
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} (NIT: {e.nit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Account Status Switch & Password Policy */}
              <div className="p-3 bg-slate-50 dark:bg-[#081B3A] rounded-xl border border-slate-200/80 dark:border-[#1A3668] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Estado de la Cuenta
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Determina si el usuario puede iniciar sesión en la plataforma
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivo(!activo)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activo
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{activo ? 'Activo' : 'Inactivo'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-[#1A3668]/80 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editRequierePass"
                    checked={requiereCambioPassword}
                    onChange={(e) => setRequiereCambioPassword(e.target.checked)}
                    className="w-4 h-4 text-[#1565C0] rounded"
                  />
                  <label htmlFor="editRequierePass" className="text-slate-600 dark:text-slate-400 cursor-pointer">
                    Exigir cambio de contraseña en próximo inicio de sesión
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1A3668]">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarAbierto(false);
                    setUsuarioEditando(null);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1565C0] hover:bg-[#1976D2] text-white font-bold rounded-xl shadow-xs active:scale-95 transition"
                >
                  Guardar Modificaciones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E244D] rounded-2xl max-w-sm w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ¿Eliminar Usuario?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Estás seguro de que deseas eliminar permanentemente a{' '}
              <strong>{usuarioAEliminar.nombre} {usuarioAEliminar.apellidos}</strong> ({usuarioAEliminar.email})?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1A3668]">
              <button
                type="button"
                onClick={() => setUsuarioAEliminar(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
