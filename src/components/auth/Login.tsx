import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { login } from '../../lib/auth';
import { Logo } from '../common/Logo';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  AlertCircle,
  Headphones,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { setCurrentUser, navigate, showToast } = useApp();

  const [email, setEmail] = useState('mariana.salazar@sfs.com.co');
  const [password, setPassword] = useState('sfs2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast(`Bienvenido/a ${res.user.nombre} (${res.user.rol.toUpperCase()})`, 'exito');
        navigate(res.redirectTo || '/portal');
      } else {
        setError(res.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Ocurrió un error al procesar el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('sfs2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#081B3A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-[#0B2A5B] dark:text-white tracking-tight">
          Mesa de Ayuda & Mesa de Servicios
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Plataforma centralizada de soporte técnico para empresas de la industria cafetera
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#0E244D] py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200 dark:border-[#1A3668]">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="usuario@empresa.com.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] rounded-xl focus:outline-none focus:border-[#1565C0] text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Recordar sesión</span>
              </label>
              <span className="text-[#1565C0] dark:text-[#3FA2E8] hover:underline cursor-pointer">
                ¿Olvidó su contraseña?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1565C0] hover:bg-[#1976D2] active:scale-98 text-white font-bold text-xs md:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Ingresando...</span>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#1A3668] space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Acceso Rápido para Demostración
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {/* Cliente */}
              <button
                type="button"
                onClick={() => handleQuickLogin('santiago.ochoa@labastilla.com.co')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                  email === 'santiago.ochoa@labastilla.com.co'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#1565C0]" />
                    <span>Santiago Ochoa (Cliente)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Trilladora La Bastilla • Solo ve sus tickets
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#1565C0] font-bold">
                  CLIENTE
                </span>
              </button>

              {/* Agente */}
              <button
                type="button"
                onClick={() => handleQuickLogin('carlos.gomez@sfs.com.co')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                  email === 'carlos.gomez@sfs.com.co'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Carlos Gómez (Agente SFS)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Especialista ERP & Trilla • Notas internas y cola
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  AGENTE
                </span>
              </button>

              {/* Supervisor / Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('mariana.salazar@sfs.com.co')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                  email === 'mariana.salazar@sfs.com.co'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mariana Salazar (Supervisora)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Líder de Soporte • Métricas, Anuncios & Config
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  SUPERVISOR
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Conexión cifrada TLS 1.3 • Software Factory and Services S.A.S. Colombia</span>
        </div>
      </div>
    </div>
  );
};
