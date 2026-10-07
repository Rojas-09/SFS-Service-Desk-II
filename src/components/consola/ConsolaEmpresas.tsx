import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Empresa } from '../../types';
import {
  Building2,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Edit2,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const ConsolaEmpresas: React.FC = () => {
  const { empresas, tickets, guardarEmpresa, navigate } = useApp();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [planSoporte, setPlanSoporte] = useState<'Gold 24/7' | 'Platinum Empresa' | 'Standard Pyme'>('Platinum Empresa');
  const [activo, setActivo] = useState(true);

  const handleOpenCrear = () => {
    setEmpresaEditando(null);
    setNombre('');
    setNit('');
    setCiudad('Armenia');
    setDepartamento('Quindío');
    setDireccion('');
    setTelefono('+57 ');
    setEmailContacto('');
    setPlanSoporte('Platinum Empresa');
    setActivo(true);
    setModalAbierto(true);
  };

  const handleOpenEditar = (e: Empresa) => {
    setEmpresaEditando(e);
    setNombre(e.nombre);
    setNit(e.nit);
    setCiudad(e.ciudad);
    setDepartamento(e.departamento);
    setDireccion(e.direccion);
    setTelefono(e.telefono);
    setEmailContacto(e.emailContacto);
    setPlanSoporte(e.planSoporte);
    setActivo(e.activo);
    setModalAbierto(true);
  };

  const handleGuardarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim()) return;

    const nuevaEmp: Empresa = {
      id: empresaEditando ? empresaEditando.id : `emp-${Date.now()}`,
      nombre: nombre.trim(),
      nit: nit.trim(),
      ciudad: ciudad.trim(),
      departamento: departamento.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      emailContacto: emailContacto.trim(),
      planSoporte,
      activo,
      creadoEn: empresaEditando ? empresaEditando.creadoEn : new Date().toISOString(),
    };

    guardarEmpresa(nuevaEmp);
    setModalAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#0B2A5B] dark:text-white tracking-tight flex items-baseline gap-2">
            <span>Directorio de Empresas Cliente</span>
            <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
              ({empresas.length} organizaciones)
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestión de cuentas corporativas de café y asignación de planes de soporte técnico
          </p>
        </div>

        <button
          onClick={handleOpenCrear}
          className="px-4 py-2 bg-[#F37021] hover:bg-[#e06114] text-white text-xs md:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Empresa</span>
        </button>
      </div>

      {/* Grid of companies */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {empresas.map((emp) => {
          const ticketsEmpresa = tickets.filter((t) => t.empresaId === emp.id);
          const abiertos = ticketsEmpresa.filter(
            (t) => t.estado !== 'resuelto' && t.estado !== 'cerrado'
          ).length;

          return (
            <div
              key={emp.id}
              className="bg-white dark:bg-[#0E244D] p-5 rounded-2xl border border-slate-200 dark:border-[#1A3668] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1565C0] transition"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {emp.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm md:text-base font-bold text-[#0B2A5B] dark:text-white leading-tight truncate" title={emp.nombre}>
                        {emp.nombre}
                      </h2>
                      <span className="text-xs text-slate-400 font-mono">NIT: {emp.nit}</span>
                    </div>
                  </div>

                  <span className="inline-flex self-start sm:self-auto items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-[#1565C0] dark:text-blue-300 border border-blue-200 dark:border-blue-900 shrink-0">
                    Plan {emp.planSoporte}
                  </span>
                </div>

                {/* Company details */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-100 dark:border-[#1A3668]">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {emp.direccion}, {emp.ciudad} ({emp.departamento})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.emailContacto}</span>
                  </div>
                </div>
              </div>

              {/* Footer stats & edit button */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1A3668] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {abiertos} {abiertos === 1 ? 'ticket abierto' : 'tickets abiertos'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    {ticketsEmpresa.length} histórico
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditar(emp)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A3668] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    title="Editar empresa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/consola/bandeja?filtro=empresa&q=${encodeURIComponent(emp.nombre.split(' ')[0])}`)}
                    className="px-2.5 py-1 bg-[#1565C0] hover:bg-[#1976D2] text-white text-[11px] font-semibold rounded-lg transition"
                  >
                    Ver Tickets
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E244D] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-[#1A3668] shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A3668]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1565C0]" />
                <h3 className="font-bold text-base text-[#0B2A5B] dark:text-white">
                  {empresaEditando ? 'Editar Empresa Cliente' : 'Registrar Nueva Empresa'}
                </h3>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Razón Social / Nombre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Trilladora Los Andes S.A.S."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    NIT *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-7"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Plan de Soporte
                  </label>
                  <select
                    value={planSoporte}
                    onChange={(e) => setPlanSoporte(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  >
                    <option value="Platinum Empresa">Platinum Empresa</option>
                    <option value="Gold 24/7">Gold 24/7</option>
                    <option value="Standard Pyme">Standard Pyme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Dirección Sede / Planta
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Correo de Contacto
                  </label>
                  <input
                    type="email"
                    value={emailContacto}
                    onChange={(e) => setEmailContacto(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

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
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
