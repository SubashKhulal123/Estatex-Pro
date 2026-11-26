import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiHome, FiUsers, FiCalendar, FiTrendingUp, FiArrowUp, FiArrowRight, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { userAPI, propertyAPI } from '../../services/api'
import { formatPrice, formatDate, getStatusColor, getRoleColor, getRoleLabel } from '../../utils/helpers'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler)

const chartDefaults = {
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'DM Sans' } } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
}

export default function AdminDashboard() {
  const { data: platformData, isLoading: platformLoading } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: () => userAPI.platformAnalytics(),
    select: d => d.data.analytics,
  })

  const { data: propAnalytics } = useQuery({
    queryKey: ['property-analytics'],
    queryFn: () => propertyAPI.analytics(),
    select: d => d.data.analytics,
  })

  const stats = [
    { label: 'Total Properties', value: propAnalytics?.total || 0, icon: FiHome, color: 'from-blue-600 to-blue-800', change: '+12%' },
    { label: 'Total Users', value: platformData?.totalUsers || 0, icon: FiUsers, color: 'from-orange-500 to-orange-700', change: '+8%' },
    { label: 'Total Bookings', value: platformData?.totalBookings || 0, icon: FiCalendar, color: 'from-emerald-500 to-emerald-700', change: '+23%' },
    { label: 'Available Properties', value: propAnalytics?.available || 0, icon: FiTrendingUp, color: 'from-purple-500 to-purple-700', change: '+5%' },
  ]

  // Chart data
  const byTypeData = {
    labels: propAnalytics?.byType?.map(t => t._id) || [],
    datasets: [{
      label: 'Properties',
      data: propAnalytics?.byType?.map(t => t.count) || [],
      backgroundColor: ['#3b82f6','#f97316','#10b981','#8b5cf6','#f43f5e','#06b6d4','#84cc16','#f59e0b'],
      borderRadius: 8,
    }]
  }

  const byCityData = {
    labels: propAnalytics?.byCity?.slice(0, 6).map(c => c._id) || [],
    datasets: [{
      label: 'Properties',
      data: propAnalytics?.byCity?.slice(0, 6).map(c => c.count) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 5,
    }]
  }

  const userRoleData = {
    labels: platformData?.usersByRole?.map(r => getRoleLabel(r._id)) || [],
    datasets: [{
      data: platformData?.usersByRole?.map(r => r.count) || [],
      backgroundColor: ['#ef4444','#f97316','#3b82f6','#8b5cf6','#10b981'],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white text-lg" />
              </div>
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <FiArrowUp className="text-xs" />{stat.change}
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1">
              {platformLoading ? <span className="skeleton inline-block w-16 h-8 rounded" /> : stat.value.toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property by type */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Properties by Type</h3>
          <Bar data={byTypeData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, responsive: true, maintainAspectRatio: true }} />
        </motion.div>

        {/* Properties by city */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Properties by City</h3>
          <Line data={byCityData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, responsive: true }} />
        </motion.div>

        {/* Users by role */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Users by Role</h3>
          <div className="flex items-center justify-center">
            <div style={{ maxWidth: 200 }}>
              <Doughnut data={userRoleData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, padding: 12 } } }, maintainAspectRatio: true, cutout: '65%' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Users</h3>
            <Link to="/dashboard/admin/users" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View all <FiArrowRight /></Link>
          </div>
          <div className="space-y-3">
            {platformData?.recentUsers?.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/3 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {u.firstName?.[0]}{u.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-slate-500 text-xs truncate">{u.email}</p>
                </div>
                <span className={`badge text-xs ${getRoleColor(u.role)}`}>{getRoleLabel(u.role)}</span>
              </div>
            )) || <p className="text-slate-500 text-sm text-center py-4">No recent users</p>}
          </div>
        </motion.div>

        {/* Top viewed properties */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Top Viewed Properties</h3>
            <Link to="/dashboard/admin/properties" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">View all <FiArrowRight /></Link>
          </div>
          <div className="space-y-3">
            {propAnalytics?.topViewed?.map((p, i) => (
              <Link key={p._id} to={`/properties/${p._id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/3 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
                  <img src={p.thumbnail || `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=100&auto=format`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">{p.title}</p>
                  <p className="text-slate-500 text-xs">{p.city} • {formatPrice(p.price)}</p>
                </div>
                <span className="flex items-center gap-1 text-slate-400 text-xs"><FiEye />{p.views}</span>
              </Link>
            )) || <p className="text-slate-500 text-sm text-center py-4">No data</p>}
          </div>
        </motion.div>
      </div>

      {/* Quick status overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Property Status Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Available', value: propAnalytics?.available || 0, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Sold', value: propAnalytics?.sold || 0, color: 'text-red-400', bg: 'bg-red-400/10' },
            { label: 'Rented', value: propAnalytics?.rented || 0, color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { label: 'Pending', value: platformData?.pendingBookings || 0, color: 'text-blue-400', bg: 'bg-blue-400/10', label2: 'Pending Bookings' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label2 || s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
