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
  Search,
} from 'lucide-react';
import { formatoFechaHoraCO } from '../../lib/utils';

export const ConsolaUsuarios: React.FC = () => {
  const { usuarios, empresas, guardarUsuario, showToast } = useApp();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [search, setSearch] = useState('');

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<RolUsuario>('cliente');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id || '');

  const filteredUsuarios = usuarios.filter((u) => {
    if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = `${u.nombre} ${u.apellidos}`.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleOpenCrear = () => {
    setNombre('');
    setApellidos('');
    setEmail('');
    setRol('cliente');
    setCargo('');
    setTelefono('+57 ');
    setEmpresaId(empresas[0]?.id || '');
    setModalAbierto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    const nuevo: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      rol,
      cargo: cargo.trim() || (rol === 'cliente' ? 'Operador de Trilla' : 'Especialista SFS'),
      telefono: telefono.trim(),
      empresaId: rol === 'cliente' ? empresaId : undefined,
      activo: true,
      creadoEn: new Date().toISOString(),
      requiereCambioPassword: true,
    };

    guardarUsuario(nuevo);
    setModalAbierto(false);
  };

  const handleToggleActivo = (u: Usuario) => {
    guardarUsuario({ ...u, activo: !u.activo });
  };

  const handleResetPassword = (u: Usuario) => {
    guardarUsuario({ ...u, requiereCambioPassword: true });
    showToast(`Se ha enviado enlace de restablecimiento de contraseña a ${u.email}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0B2A5B] dark:text-white tracking-tight flex items-center gap-2">
            <span>Gestión de Usuarios & Accesos</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1565C0] dark:bg-blue-950 dark:text-blue-300 font-semibold">
              {usuarios.length} registrados
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administración de cuentas de clientes caficultores y especialistas del equipo SFS
          </p>
        </div>

        <button
          onClick={handleOpenCrear}
          className="px-4 py-2 bg-[#F37021] hover:bg-[#e06114] text-white text-xs md:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invitar / Crear Usuario</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-[#0E244D] p-3.5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setFiltroRol('todos')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'todos'
                ? 'bg-[#1565C0] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Todos ({usuarios.length})
          </button>
          <button
            onClick={() => setFiltroRol('cliente')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'cliente'
                ? 'bg-[#1565C0] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Clientes ({usuarios.filter((u) => u.rol === 'cliente').length})
          </button>
          <button
            onClick={() => setFiltroRol('agente')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'agente'
                ? 'bg-[#1565C0] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Agentes SFS ({usuarios.filter((u) => u.rol === 'agente').length})
          </button>
          <button
            onClick={() => setFiltroRol('supervisor')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filtroRol === 'supervisor'
                ? 'bg-[#1565C0] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Supervisores / TI ({usuarios.filter((u) => u.rol === 'supervisor' || u.rol === 'admin').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-[#0E244D] rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-[#081B3A] text-slate-500 font-semibold border-b border-slate-200 dark:border-[#1A3668]">
              <tr>
                <th className="p-3.5">Usuario</th>
                <th className="p-3.5">Rol</th>
                <th className="p-3.5">Empresa / Organización</th>
                <th className="p-3.5">Cargo</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Último Acceso</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1A3668]">
              {filteredUsuarios.map((u) => {
                const emp = u.empresaId ? empresas.find((e) => e.id === u.empresaId) : null;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-xs uppercase">
                          {u.nombre[0]}
                          {u.apellidos[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {u.nombre} {u.apellidos}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.rol === 'cliente'
                            ? 'bg-blue-100 text-[#1565C0]'
                            : u.rol === 'agente'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.rol === 'supervisor'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.rol.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {emp ? (
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.nombre.split(' ')[0]} {emp.nombre.split(' ')[1] || ''}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold">Software Factory & Services (SFS)</span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-500">{u.cargo}</td>

                    <td className="p-3.5">
                      {u.activo ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {formatoFechaHoraCO(u.ultimoAcceso || u.creadoEn)}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition"
                          title="Restablecer contraseña"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActivo(u)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            u.activo
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
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
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E244D] rounded-2xl max-w-md w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A3668]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1565C0]" />
                <h3 className="font-bold text-base text-[#0B2A5B] dark:text-white">
                  Invitar / Crear Usuario
                </h3>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Rol en el Sistema
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolUsuario)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  >
                    <option value="cliente">Cliente (Empresa)</option>
                    <option value="agente">Agente SFS</option>
                    <option value="supervisor">Supervisor SFS</option>
                    <option value="admin">Administrador TI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Jefe de Trilla"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {rol === 'cliente' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Empresa Cliente
                  </label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  >
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-[#1A3668]">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1565C0] hover:bg-[#1976D2] text-white font-bold rounded-xl shadow-xs"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
