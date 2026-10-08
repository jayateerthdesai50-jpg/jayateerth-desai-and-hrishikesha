import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Activity,
  Trophy,
  Users,
  Compass,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Swords,
  BookOpen,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

export const Navbar: React.FC = () => {
  const { user, profile, logout, demoLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Find Courts', path: '/courts', icon: Compass },
    { name: 'My Bookings', path: '/bookings', icon: Calendar },
    { name: 'Matches', path: '/matches', icon: Swords },
    { name: 'Players', path: '/players', icon: Users },
    { name: 'Performance', path: '/performance', icon: Trophy },
    { name: 'AI & Online Coach', path: '/coach', icon: Sparkles, badge: 'AI' },
    { name: 'Research', path: '/research', icon: BookOpen },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  const handleRoleToggle = async () => {
    setSwitchingRole(true);
    try {
      if (user?.role === 'ADMIN') {
        await demoLogin('PLAYER');
        navigate('/');
      } else {
        await demoLogin('ADMIN');
        navigate('/admin');
      }
    } finally {
      setSwitchingRole(false);
      setUserMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🏸</span>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  RallySphere
                  <span className="text-[10px] tracking-wider uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    BWF Pro
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Play. Rally. Improve.</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-sm animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Button */}
            <button
              onClick={handleRoleToggle}
              disabled={switchingRole}
              title={`Switch active demo role (Currently: ${user?.role || 'Player'})`}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600 shadow-sm"
            >
              <ArrowRightLeft className={`w-3.5 h-3.5 text-emerald-400 ${switchingRole ? 'animate-spin' : ''}`} />
              <span>
                {user?.role === 'ADMIN' ? 'Switch to Player Mode' : 'Switch to Facility Admin'}
              </span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markAsRead(n.id);
                            if (n.link) {
                              navigate(n.link);
                              setNotificationsOpen(false);
                            }
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-800/50 ${
                            !n.read ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-semibold ${!n.read ? 'text-emerald-300' : 'text-slate-200'}`}>
                              {n.title}
                            </h4>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={profile?.name || user.email}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {profile?.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">
                      {user.role}
                    </p>
                  </div>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white">{profile?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Role: {user.role}</span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Player Profile</span>
                    </Link>

                    <Link
                      to="/performance"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>My Performance & Coach</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleRoleToggle();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        Switch to {user.role === 'ADMIN' ? 'Player (Alex)' : 'Admin'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="flex-1">{link.name}</span>
                {link.badge && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 mt-2 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleRoleToggle();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Toggle: {user?.role === 'ADMIN' ? 'Player Mode' : 'Admin Facility Mode'}
              </span>
            </button>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/auth');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
