import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  BarChart3, 
  Megaphone, 
  MessageSquare, 
  User, 
  Bell, 
  Search, 
  Menu, 
  X,
  Moon,
  Sun,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/lib/auth-context';
import { AuthPage } from '@/src/features/auth/AuthPage';
import { LogOut } from 'lucide-react';
import { Home } from '@/src/features/dashboard/Home';
import { EnquetesList } from '@/src/features/enquetes/EnquetesList';
import { AdminDashboard } from '@/src/features/admin/AdminDashboard';

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  variant?: 'default' | 'admin';
}

const NavItem = ({ icon: Icon, label, active, onClick, collapsed, variant = 'default' }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full",
      active 
        ? (variant === 'admin' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-blue-600 text-white shadow-lg shadow-blue-600/20")
        : "text-zinc-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "group-hover:scale-110 transition-transform")} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
);

export const AppShell = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Toggle dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Início' },
    { id: 'enquetes', icon: BarChart3, label: 'Enquetes' },
    { id: 'denuncias', icon: Megaphone, label: 'Denúncias' },
    { id: 'foruns', icon: MessageSquare, label: 'Fóruns' },
    { id: 'perfil', icon: User, label: 'Meu Perfil' },
  ];

  const adminItems = [
    { id: 'admin', icon: ShieldAlert, label: 'Administração' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Carregando ParticipaAI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'enquetes': return <EnquetesList />;
      case 'admin': return <AdminDashboard />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
          <ShieldCheck size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Módulo em desenvolvimento</p>
          <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 z-50 hidden md:flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">particip<span className="text-blue-600">.ai</span></span>
            </motion.div>
          )}
          {!isSidebarOpen && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <ShieldCheck className="text-white" size={20} />
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {navItems.map((item) => (
            <div key={item.id}>
              <NavItem
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                collapsed={!isSidebarOpen}
              />
            </div>
          ))}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              {isSidebarOpen && <p className="px-4 text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-2">Sistema</p>}
              {adminItems.map((item) => (
                <div key={item.id}>
                  <NavItem
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    collapsed={!isSidebarOpen}
                    variant="admin"
                  />
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="font-medium text-sm">Sair</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        "md:pl-20",
        isSidebarOpen && "md:pl-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex-1 max-w-md relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar enquetes, projetos..."
                className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{profile?.nome_completo || user.email}</p>
                  <p className="text-xs text-zinc-500">Nível: {profile?.nivel || 'Cadastrado'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {(profile?.nome_completo || user.email || 'U').substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-2 flex justify-around items-center md:hidden z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
              activeTab === item.id ? "text-blue-600" : "text-zinc-400"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
