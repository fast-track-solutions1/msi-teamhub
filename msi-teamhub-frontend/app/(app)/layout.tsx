'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Users, FileText, GitBranch, Monitor, Briefcase, Award, 
  Settings, ChevronDown, Menu, X, LogOut, Sun, Moon, Search, 
  Bell, BookOpen, Building2, Building, Wrench, User 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainMenu = [
  { label: 'Tableau de bord', href: '/dashboard', icon: Home },
  { label: 'Salariés', href: '/employees', icon: Users },
  { label: 'Fiches de poste', href: '/job-descriptions', icon: FileText },
  { label: 'Organigramme', href: '/org-chart', icon: GitBranch },
  { label: 'Gestion des équipements', href: '/equipment', icon: Monitor },
  { label: 'Services', href: '/services', icon: Briefcase },
  { label: 'Grades', href: '/grades', icon: Award },
];

const settingsMenu = [
  { label: 'Paramètres sociétés', href: '/settings/companies', icon: Building2 },
  { label: 'Paramètres grades', href: '/settings/grades', icon: Award },
  { label: 'Paramètres services', href: '/settings/services', icon: Briefcase },
  { label: 'Paramètres départements', href: '/settings/departments', icon: Building },
  { label: 'Paramètres équipements', href: '/settings/equipment', icon: Wrench },
];

const annuairesMenu = [
  { label: 'Salariés', href: '/annuaires/salaries', icon: Users },
  { label: 'Sociétés', href: '/annuaires/societes', icon: Building2 },
  { label: 'Départements', href: '/annuaires/departements', icon: Building },
  { label: 'Services', href: '/annuaires/services', icon: Briefcase },
  { label: 'Grades', href: '/annuaires/grades', icon: Award },
  { label: 'Équipements', href: '/annuaires/equipements', icon: Wrench },
  { label: 'Fiches de Postes', href: '/annuaires/fiches-postes', icon: FileText },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [annuairesOpen, setAnnuairesOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const isActive = (href: string) => pathname === href;

  if (!mounted) return null;

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-72' : 'w-20'} 
        ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'} 
        border-r backdrop-blur-xl flex flex-col transition-all duration-300 shadow-2xl
      `}>
        {/* Logo */}
        <div className={`p-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center gap-3`}>
          <div className="relative h-12 w-12 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl animate-pulse"></div>
            <div className="relative h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl font-black text-white">M</span>
            </div>
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-gradient">
                MSI TeamHub
              </div>
              <div className={`text-xs font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Gestion RH Moderne
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {/* Main Menu */}
          {mainMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${active 
                    ? darkMode 
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 shadow-lg shadow-blue-500/20 border border-blue-500/30' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-md border border-blue-200'
                    : darkMode
                      ? 'text-slate-400 hover:bg-slate-800/50 hover:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                )}
                
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                
                {sidebarOpen && (
                  <span className="text-sm font-semibold">{item.label}</span>
                )}
                
                {/* Hover glow effect */}
                {!active && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </Link>
            );
          })}

          {/* Annuaires Section */}
          <div className={`pt-4 mt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              onClick={() => setAnnuairesOpen(!annuairesOpen)}
              className={`
                group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                ${annuairesOpen
                  ? darkMode
                    ? 'bg-slate-800/70 text-blue-400'
                    : 'bg-slate-100 text-blue-600'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <BookOpen className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${annuairesOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
                {sidebarOpen && <span className="text-sm font-semibold">Annuaires</span>}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${annuairesOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {annuairesOpen && sidebarOpen && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-blue-500/30 pl-3 animate-slideDown">
                {annuairesMenu.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={`
                        group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${active 
                          ? darkMode 
                            ? 'text-blue-400 bg-blue-500/10' 
                            : 'text-blue-600 bg-blue-50'
                          : darkMode
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/30'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className={`pt-4 mt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`
                group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                ${settingsOpen
                  ? darkMode
                    ? 'bg-slate-800/70 text-blue-400'
                    : 'bg-slate-100 text-blue-600'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800/50 hover:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Settings className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${settingsOpen ? 'rotate-90 scale-110' : 'group-hover:rotate-90 group-hover:scale-110'}`} />
                {sidebarOpen && <span className="text-sm font-semibold">Paramètres</span>}
              </div>
              {sidebarOpen && (
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {settingsOpen && sidebarOpen && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-purple-500/30 pl-3 animate-slideDown">
                {settingsMenu.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={`
                        group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${active 
                          ? darkMode 
                            ? 'text-purple-400 bg-purple-500/10' 
                            : 'text-purple-600 bg-purple-50'
                          : darkMode
                            ? 'text-slate-400 hover:text-purple-400 hover:bg-slate-800/30'
                            : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} space-y-2`}>
          {sidebarOpen && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>Admin User</div>
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>admin@msi.com</div>
              </div>
            </div>
          )}
          
          <button className={`
            group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            ${darkMode 
              ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }
          `}>
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            {sidebarOpen && <span className="text-sm font-semibold">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`
          border-b ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'} 
          backdrop-blur-xl transition-colors duration-300 shadow-sm
        `}>
          <div className="flex items-center justify-between px-6 py-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`
                p-2.5 rounded-xl transition-all duration-300
                ${darkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-blue-400' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-blue-600'
                }
              `}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex-1 max-w-xl ml-6">
              <div className="relative group">
                <Search className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200 ${darkMode ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <input
                  type="text"
                  placeholder="Rechercher des salariés, équipements, documents..."
                  className={`
                    w-full pl-12 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${darkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500'
                    }
                    border focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-6">
              <button className={`
                p-2.5 rounded-xl transition-all duration-300 relative
                ${darkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-blue-400' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-blue-600'
                }
              `}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  p-2.5 rounded-xl transition-all duration-300
                  ${darkMode 
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 animate-spin-slow" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <button className={`
                p-2.5 rounded-xl transition-all duration-300
                ${darkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-blue-400' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-blue-600'
                }
              `}>
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
