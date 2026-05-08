import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';
import {
  Home,
  Share2,
  Layers,
  BarChart3,
  Wallet,
  Bell,
  User as UserIcon,
  LogOut,
  Search,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useGetMeQuery } from '../../api/authApi';

interface CabinetLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function CabinetLayout({ children, title }: CabinetLayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: meData } = useGetMeQuery(undefined);
  const me = meData?.data;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('common.dashboard'), icon: Home, section: 'КАБИНЕТ', path: '/' },
    { name: t('common.tree'), icon: Share2, section: 'КАБИНЕТ', path: '/tree' },
    { name: t('common.levels'), icon: Layers, section: 'КАБИНЕТ', path: '/levels' },
    { name: 'Бонусы', icon: BarChart3, section: 'КАБИНЕТ', path: '/bonuses' },
    { name: t('common.withdraw'), icon: Wallet, section: 'КАБИНЕТ', path: '/withdraw' },
    { name: t('common.notifications'), icon: Bell, section: 'АККАУНТ', path: '/notifications' },
    { name: t('common.profile'), icon: UserIcon, section: 'АККАУНТ', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F5F0] font-sans antialiased">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#1B2B20] text-white flex flex-col p-6 z-40 transition-transform lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10 lg:block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A7C5E] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/20" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Green Eco Mall</h1>
              <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">ECO · KGZ</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-8">
          <div>
            <p className="text-[10px] font-bold text-white/30 tracking-[0.15em] mb-4">КАБИНЕТ</p>
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'КАБИНЕТ').map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:bg-white/5 hover:text-white/80",
                    isActive(item.path) && "bg-white/10 text-white"
                  )}
                >
                  <item.icon size={18} strokeWidth={2} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-[#E07840] text-[10px] font-bold flex items-center justify-center text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-white/30 tracking-[0.15em] mb-4">АККАУНТ</p>
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'АККАУНТ').map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:bg-white/5 hover:text-white/80",
                    isActive(item.path) && "bg-white/10 text-white"
                  )}
                >
                  <item.icon size={18} strokeWidth={2} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-[#E07840] text-[10px] font-bold flex items-center justify-center text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>


        <div className="mt-auto space-y-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
          >
            <LogOut size={18} />
            <span>{t('common.logout')}</span>
          </button>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-[#E07840]/20 flex items-center justify-center text-[#E07840] font-bold text-xs">
              {me?.firstName?.[0]}{me?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{me?.firstName} {me?.lastName}</p>
              <p className="text-[10px] text-white/40 font-medium tracking-tight">
                USER · <span className="uppercase">{me?.referralCode ?? ''}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-20 lg:pb-12 min-w-0">
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl border border-[#E5DDD0] bg-white flex items-center justify-center text-[#1A1A1A]/60"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[10px] font-bold text-[#9B9589] tracking-widest uppercase mb-1 hidden sm:block">КАБИНЕТ УЧАСТНИКА</p>
              <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <LanguageSwitcher />
              <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-[#E5DDD0] bg-white flex items-center justify-center text-[#1A1A1A]/60 hover:bg-[#F8F5F0] transition-all">
                <Search size={18} />
              </button>
              <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-[#E5DDD0] bg-white flex items-center justify-center text-[#1A1A1A]/60 hover:bg-[#F8F5F0] transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E07840] border-2 border-white" />
              </button>
              <button className="hidden sm:flex w-10 h-10 rounded-xl border border-[#E5DDD0] bg-white items-center justify-center text-[#1A1A1A]/60 hover:bg-[#F8F5F0] transition-all">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
