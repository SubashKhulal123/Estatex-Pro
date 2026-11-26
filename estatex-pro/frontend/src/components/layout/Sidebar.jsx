import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiGrid, FiHome, FiUsers, FiCalendar, FiBarChart2, FiFileText,
  FiHeart, FiMessageSquare, FiSettings, FiLogOut,
  FiPlusCircle, FiList, FiTrendingUp, FiChevronLeft
} from 'react-icons/fi'
import { HiOutlineHome } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { getRoleLabel } from '../../utils/helpers'

const NAV = {
  super_admin: [
    { to:'/dashboard/admin',            label:'Overview',       icon:FiGrid,      exact:true },
    { to:'/dashboard/admin/properties', label:'Properties',     icon:FiHome },
    { to:'/dashboard/admin/users',      label:'Users',          icon:FiUsers },
    { to:'/dashboard/admin/bookings',   label:'Bookings',       icon:FiCalendar },
    { to:'/dashboard/admin/analytics',  label:'Analytics',      icon:FiBarChart2 },
    { to:'/dashboard/admin/reports',    label:'Reports',        icon:FiFileText },
  ],
  admin: [
    { to:'/dashboard/admin',            label:'Overview',       icon:FiGrid,      exact:true },
    { to:'/dashboard/admin/properties', label:'Properties',     icon:FiHome },
    { to:'/dashboard/admin/users',      label:'Users',          icon:FiUsers },
    { to:'/dashboard/admin/bookings',   label:'Bookings',       icon:FiCalendar },
    { to:'/dashboard/admin/analytics',  label:'Analytics',      icon:FiBarChart2 },
    { to:'/dashboard/admin/reports',    label:'Reports',        icon:FiFileText },
  ],
  agent: [
    { to:'/dashboard/agent',                 label:'Overview',       icon:FiGrid,      exact:true },
    { to:'/dashboard/agent/listings',        label:'My Listings',    icon:FiList },
    { to:'/dashboard/agent/add-property',    label:'Add Property',   icon:FiPlusCircle },
    { to:'/dashboard/agent/requests',        label:'Visit Requests', icon:FiCalendar },
    { to:'/dashboard/agent/analytics',       label:'Analytics',      icon:FiTrendingUp },
  ],
  property_manager: [
    { to:'/dashboard/agent',            label:'Overview',       icon:FiGrid,      exact:true },
    { to:'/dashboard/agent/listings',   label:'Properties',     icon:FiList },
    { to:'/dashboard/agent/requests',   label:'Visits',         icon:FiCalendar },
    { to:'/dashboard/agent/analytics',  label:'Analytics',      icon:FiTrendingUp },
  ],
  customer: [
    { to:'/dashboard/customer',            label:'Overview',  icon:FiGrid,          exact:true },
    { to:'/dashboard/customer/saved',      label:'Saved',     icon:FiHeart },
    { to:'/dashboard/customer/bookings',   label:'Bookings',  icon:FiCalendar },
    { to:'/dashboard/customer/messages',   label:'Messages',  icon:FiMessageSquare },
    { to:'/dashboard/customer/profile',    label:'Profile',   icon:FiSettings },
  ],
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role  = user?.role || 'customer'
  const items = NAV[role]  || NAV.customer

  return (
    <motion.aside
      initial={{ x:-280 }}
      animate={{ x:0 }}
      transition={{ duration:0.3, ease:'easeOut' }}
      className="sidebar w-64 min-h-screen flex flex-col sidebar-scroll overflow-y-auto"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <HiOutlineHome className="text-white text-base" />
            </div>
            <span className="font-display font-bold text-lg">
              Estate<span className="text-blue-400">X</span>
              <span className="text-orange-500"> Pro</span>
            </span>
          </NavLink>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden p-1">
              <FiChevronLeft className="text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-4 mx-3 my-3 rounded-xl bg-white/3 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none' }} />
              : `${user?.firstName?.[0] || '?'}${user?.lastName?.[0] || ''}`}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500">{getRoleLabel(role)}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-1">Menu</p>
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        <NavLink to="/properties"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          <FiHome className="text-lg flex-shrink-0" /> Browse Properties
        </NavLink>
        <button onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
          <FiLogOut className="text-lg flex-shrink-0" /> Logout
        </button>
      </div>
    </motion.aside>
  )
}
