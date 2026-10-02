import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/consola/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { Login } from './components/auth/Login';
import { ConsolaBandeja } from './components/consola/ConsolaBandeja';
import { ConsolaTicketDetail } from './components/consola/ConsolaTicketDetail';
import { ConsolaMetricas } from './components/consola/ConsolaMetricas';
import { ConsolaAnuncios } from './components/consola/ConsolaAnuncios';
import { ConsolaEmpresas } from './components/consola/ConsolaEmpresas';
import { ConsolaUsuarios } from './components/consola/ConsolaUsuarios';
import { ConsolaConfiguracion } from './components/consola/ConsolaConfiguracion';
import { PortalView } from './components/portal/PortalView';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, currentPath, navigate, showToast } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Protected Routes & Middleware Guard
  useEffect(() => {
    if (!currentUser && currentPath !== '/login') {
      navigate('/login');
      return;
    }

    if (currentUser?.rol === 'cliente' && currentPath.startsWith('/consola')) {
      showToast('Acceso restringido: El portal de consola es exclusivo para el equipo SFS', 'advertencia');
      navigate('/portal');
    }
  }, [currentUser, currentPath]);

  // If on login page
  if (currentPath === '/login' || !currentUser) {
    return (
      <main>
        <Login />
        <ToastContainer />
      </main>
    );
  }

  // Parse path and params
  const cleanPath = currentPath.split('?')[0];

  // CLIENT PORTAL LAYOUT
  if (cleanPath.startsWith('/portal')) {
    let subView: 'inicio' | 'nuevo' | 'tickets' | 'detalle' = 'inicio';
    let ticketId: string | undefined = undefined;

    if (cleanPath === '/portal/nuevo') {
      subView = 'nuevo';
    } else if (cleanPath.startsWith('/portal/ticket/')) {
      subView = 'detalle';
      ticketId = cleanPath.replace('/portal/ticket/', '');
    }

    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#081B3A] text-slate-800 dark:text-slate-100 transition-colors">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <PortalView subView={subView} ticketId={ticketId} />
        </main>
        <ToastContainer />
        <NotificationDrawer />
      </div>
    );
  }

  // SFS CONSOLE LAYOUT
  return (
    <div className="min-h-screen flex bg-[#F5F7FB] dark:bg-[#081B3A] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Marine blue sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          showSidebarToggle={true}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {cleanPath.startsWith('/consola/ticket/') ? (
            <ConsolaTicketDetail ticketId={cleanPath.replace('/consola/ticket/', '')} />
          ) : cleanPath === '/consola/metricas' ? (
            <ConsolaMetricas />
          ) : cleanPath === '/consola/anuncios' ? (
            currentUser.rol === 'agente' ? (
              <AccesoDenegado />
            ) : (
              <ConsolaAnuncios />
            )
          ) : cleanPath === '/consola/empresas' ? (
            currentUser.rol === 'agente' ? (
              <AccesoDenegado />
            ) : (
              <ConsolaEmpresas />
            )
          ) : cleanPath === '/consola/usuarios' ? (
            currentUser.rol === 'agente' ? (
              <AccesoDenegado />
            ) : (
              <ConsolaUsuarios />
            )
          ) : cleanPath === '/consola/configuracion' ? (
            currentUser.rol === 'agente' ? (
              <AccesoDenegado />
            ) : (
              <ConsolaConfiguracion />
            )
          ) : (
            <ConsolaBandeja />
          )}
        </main>
      </div>

      <ToastContainer />
      <NotificationDrawer />
    </div>
  );
};

const AccesoDenegado: React.FC = () => {
  const { navigate } = useApp();
  return (
    <div className="p-12 text-center bg-white dark:bg-[#0E244D] rounded-2xl border border-slate-200 dark:border-[#1A3668] max-w-md mx-auto my-12">
      <ShieldAlert className="w-12 h-12 text-[#F37021] mx-auto mb-3" />
      <h2 className="text-base font-bold text-slate-800 dark:text-white">Acceso Restringido</h2>
      <p className="text-xs text-slate-500 mt-1 mb-4">
        Esta sección está reservada para supervisores y administradores de Software Factory and Services (SFS).
      </p>
      <button
        onClick={() => navigate('/consola/bandeja')}
        className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg"
      >
        Volver a la Bandeja
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
