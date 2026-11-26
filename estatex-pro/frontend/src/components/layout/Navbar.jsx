import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMenu, FiX, FiLogOut, FiUser, FiSettings } from 'react-icons/fi'
import { HiOutlineHome } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { getRoleLabel } from '../../utils/helpers'
import NotificationBell from '../common/NotificationBell'
import GlobalSearch from '../common/GlobalSearch'

export default function Navbar() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const location          = useLocation()
  const [scrolled,        setScrolled]      = useState(false)
  const [mobileOpen,      setMobileOpen]    = useState(false)
  const [profileOpen,     setProfileOpen]   = useState(false)
  const [searchOpen,      setSearchOpen]    = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest('[data-profile-dropdown]')) setProfileOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Global keyboard shortcut: Cmd/Ctrl+K opens search
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  const getDashboardLink = () => {
    if (!user) return '/login'
    return { super_admin:'/dashboard/admin', admin:'/dashboard/admin', agent:'/dashboard/agent', property_manager:'/dashboard/agent', customer:'/dashboard/customer' }[user.role] || '/dashboard/customer'
  }

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false) }

  const navLinks = [
    { to: '/',          label: 'Home' },
    { to: '/properties',label: 'Properties' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <HiOutlineHome className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-xl hidden sm:block">
                Estate<span className="text-blue-400">X</span><span className="text-orange-500"> Pro</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${location.pathname === l.to ? 'text-blue-400' : 'text-slate-300'}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Search bar (desktop) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 flex-1 max-w-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm hover:bg-white/8 hover:border-white/20 transition-all"
            >
              <FiSearch className="flex-shrink-0" />
              <span className="flex-1 text-left">Search properties…</span>
              <kbd className="text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
            </button>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Mobile search */}
              <button onClick={() => setSearchOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                <FiSearch className="text-xl" />
              </button>

              {user ? (
                <>
                  <NotificationBell />

                  <Link to={getDashboardLink()} className="hidden lg:flex btn-ghost text-sm py-2 px-4">
                    Dashboard
                  </Link>

                  {/* Profile */}
                  <div className="relative" data-profile-dropdown>
                    <button
                      onClick={() => setProfileOpen(o => !o)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {user.avatar
                          ? <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none' }} />
                          : `${user.firstName?.[0]}${user.lastName?.[0]}`}
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-white leading-none">{user.firstName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{getRoleLabel(user.role)}</p>
                      </div>
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity:0, y:8, scale:0.95 }}
                          animate={{ opacity:1, y:0, scale:1 }}
                          exit={{ opacity:0, y:8, scale:0.95 }}
                          transition={{ duration:0.15 }}
                          className="absolute right-0 top-12 w-56 glass-card p-2 shadow-2xl z-50"
                        >
                          <div className="px-3 py-2 mb-1 border-b border-white/5">
                            <p className="font-semibold text-white text-sm">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                          <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors">
                            <FiUser className="text-base flex-shrink-0" /> Dashboard
                          </Link>
                          <Link to="/dashboard/customer/profile" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white text-sm transition-colors">
                            <FiSettings className="text-base flex-shrink-0" /> Settings
                          </Link>
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 text-sm transition-colors mt-1 border-t border-white/5 pt-2">
                            <FiLogOut className="text-base flex-shrink-0" /> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden lg:flex btn-ghost text-sm py-2 px-4">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity:0, height:0 }}
              animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }}
              className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-1"
            >
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-blue-400 hover:bg-blue-400/10 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/dashboard/customer/profile" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 text-sm font-medium">
                    Settings
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 text-sm font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 text-sm font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium text-center">
                    Get Started
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity:0, y:-20, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-20, scale:0.97 }}
              transition={{ duration:0.2 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
            >
              <GlobalSearch onClose={() => setSearchOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
