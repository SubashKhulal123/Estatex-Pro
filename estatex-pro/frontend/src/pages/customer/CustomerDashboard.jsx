import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiHeart, FiCalendar, FiEye, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { bookingAPI } from '../../services/api'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&auto=format&fit=crop'

export default function CustomerDashboard() {
  const { user } = useAuth()

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.myBookings(),
    select: d => d.data.bookings,
  })

  const savedCount = user?.savedProperties?.length || 0
  const stats = [
    { label: 'Saved Properties', value: savedCount, icon: FiHeart, color: 'from-red-500 to-red-700', to: '/dashboard/customer/saved' },
    { label: 'Total Bookings', value: bookings?.length || 0, icon: FiCalendar, color: 'from-blue-600 to-blue-800', to: '/dashboard/customer/bookings' },
    { label: 'Pending Visits', value: bookings?.filter(b => b.status === 'pending').length || 0, icon: FiEye, color: 'from-orange-500 to-orange-700', to: '/dashboard/customer/bookings' },
    { label: 'Approved Visits', value: bookings?.filter(b => b.status === 'approved').length || 0, icon: FiArrowRight, color: 'from-emerald-500 to-emerald-700', to: '/dashboard/customer/bookings' },
  ]

  const recentBookings = bookings?.slice(0, 3) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user?.firstName}!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={s.to} className="stat-card block hover:scale-[1.02] transition-transform">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="text-white text-lg" />
              </div>
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent bookings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Recent Bookings</h3>
          <Link to="/dashboard/customer/bookings" className="text-blue-400 text-sm flex items-center gap-1">View all <FiArrowRight /></Link>
        </div>
        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map(b => (
              <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
                  <img src={b.property?.thumbnail?.startsWith('http') ? b.property.thumbnail : FALLBACK_IMG} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{b.property?.title}</p>
                  <p className="text-slate-500 text-xs">{b.property?.city} • {formatDate(b.visitDate)} at {b.visitTime}</p>
                </div>
                <span className={`badge text-xs ${getStatusColor(b.status)}`}>{b.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCalendar className="text-3xl text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm mb-3">No bookings yet</p>
            <Link to="/properties" className="btn-primary text-sm py-2">Browse Properties</Link>
          </div>
        )}
      </motion.div>

      {/* Browse CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative glass-card p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-orange-500/5" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-1">Find Your Next Home</h3>
            <p className="text-slate-400 text-sm">Browse thousands of premium properties</p>
          </div>
          <Link to="/properties" className="btn-primary">Browse Properties <FiArrowRight /></Link>
        </div>
      </motion.div>
    </div>
  )
}
