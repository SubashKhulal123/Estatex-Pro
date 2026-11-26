import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiHome, FiCalendar, FiEye, FiArrowRight, FiCheck, FiX, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { propertyAPI, bookingAPI } from '../../services/api'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&auto=format&fit=crop'

export default function AgentDashboard() {
  const { user } = useAuth()

  const { data: listings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => propertyAPI.myListings(),
    select: d => d.data.properties,
  })

  const { data: requests } = useQuery({
    queryKey: ['agent-requests'],
    queryFn: () => bookingAPI.agentRequests(),
    select: d => d.data.bookings,
  })

  const stats = [
    { label: 'My Listings', value: listings?.length || 0, icon: FiHome, color: 'from-blue-600 to-blue-800' },
    { label: 'Visit Requests', value: requests?.length || 0, icon: FiCalendar, color: 'from-orange-500 to-orange-700' },
    { label: 'Pending', value: requests?.filter(r => r.status === 'pending').length || 0, icon: FiClock, color: 'from-yellow-500 to-yellow-700' },
    { label: 'Total Views', value: listings?.reduce((sum, p) => sum + (p.views || 0), 0) || 0, icon: FiEye, color: 'from-emerald-500 to-emerald-700' },
  ]

  const viewsChartData = {
    labels: listings?.slice(0, 6).map(p => p.title.slice(0, 12) + '…') || [],
    datasets: [{
      label: 'Views',
      data: listings?.slice(0, 6).map(p => p.views || 0) || [],
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderRadius: 6,
    }]
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || []
  const recentListings = listings?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Agent Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="text-white text-lg" />
            </div>
            <p className="text-2xl font-display font-bold text-white">{s.value.toLocaleString()}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Property Views</h3>
            <Link to="/dashboard/agent/listings" className="text-blue-400 text-sm flex items-center gap-1">All listings <FiArrowRight /></Link>
          </div>
          {listings?.length > 0 ? (
            <Bar
              data={viewsChartData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
                  y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
                },
                responsive: true,
              }}
            />
          ) : <p className="text-slate-500 text-sm text-center py-8">No listings yet</p>}
        </motion.div>

        {/* Pending requests */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Pending Requests</h3>
            <Link to="/dashboard/agent/requests" className="text-blue-400 text-sm flex items-center gap-1">View all <FiArrowRight /></Link>
          </div>
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map(req => (
                <div key={req._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                    <FiCalendar />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{req.property?.title}</p>
                    <p className="text-slate-500 text-xs">{req.customer?.firstName} {req.customer?.lastName} • {formatDate(req.visitDate)} at {req.visitTime}</p>
                  </div>
                  <span className={`badge text-xs ${getStatusColor(req.status)}`}>{req.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="text-3xl text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No pending requests</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent listings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">My Listings</h3>
          <Link to="/dashboard/agent/listings" className="text-blue-400 text-sm flex items-center gap-1">View all <FiArrowRight /></Link>
        </div>
        {recentListings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Listed</th>
                </tr>
              </thead>
              <tbody>
                {recentListings.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                          <img src={p.thumbnail?.startsWith('http') ? p.thumbnail : FALLBACK_IMG} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG }} />
                        </div>
                        <p className="text-white text-sm font-medium line-clamp-1 max-w-48">{p.title}</p>
                      </div>
                    </td>
                    <td className="text-blue-400 font-semibold text-sm">{formatPrice(p.price, p.priceType)}</td>
                    <td><span className={`badge text-xs ${getStatusColor(p.status)}`}>{p.status}</span></td>
                    <td className="text-slate-400 text-sm">{p.views || 0}</td>
                    <td className="text-slate-400 text-sm">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FiHome className="text-3xl text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm mb-3">No listings yet</p>
            <Link to="/dashboard/agent/add-property" className="btn-primary text-sm py-2">Add Your First Property</Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
