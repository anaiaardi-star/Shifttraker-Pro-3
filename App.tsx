
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { Users } from './components/Users'; // Nuevo componente
import { Profile } from './components/Profile';
import { ApiService, User } from './services/api';

export enum Page {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  REPORTS = 'reports',
  USERS = 'users',
  PROFILE = 'profile'
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión activa al cargar
    const user = ApiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentPage(Page.DASHBOARD);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentPage(Page.DASHBOARD);
  };

  const handleLogout = () => {
    ApiService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage(Page.LOGIN);
  };

  // Lógica de renderizado para usuarios NO autenticados
  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard user={currentUser} />;
      case Page.REPORTS:
        // Protección de Ruta: Solo Admins
        if (currentUser?.role === 'Admin') {
          return <Reports />;
        }
        return <Dashboard user={currentUser} />;
      case Page.USERS:
        // Protección de Ruta: Gestión de Usuarios Solo Admins
        if (currentUser?.role === 'Admin') {
          return <Users />;
        }
        return <Dashboard user={currentUser} />;
      case Page.PROFILE:
        return <Profile user={currentUser} />;
      default:
        return <Dashboard user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout}
        user={currentUser}
      />
      <main className="flex-1 flex flex-col">
        {renderPage()}
      </main>
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-background-dark/50">
        <p className="text-slate-400 text-xs font-medium">
          ShiftTrack Enterprise v2.6.0 • Powered by <strong className="text-orange-500">ALPHA 360</strong> (Port: 5678) • ardi.agency
        </p>
      </footer>
    </div>
  );
};

export default App;
