import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiHome, FiEye, FiCalendar, FiTrendingUp, FiArrowUp } from 'react-icons/fi'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js'
import { propertyAPI, bookingAPI } from '../../services/api'
import { formatPrice, getStatusColor } from '../../utils/helpers'
import { Link } from 'react-router-dom'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler)

const chartTooltip = {
  backgroundColor: '#1e293b',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#f8fafc',
  bodyColor: '#94a3b8',
}

export default function AgentAnalytics() {
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

  const totalViews = listings?.reduce((s, p) => s + (p.views || 0), 0) || 0
  const approved = requests?.filter(r => r.status === 'approved').length || 0
  const pending = requests?.filter(r => r.status === 'pending').length || 0
  const rejected = requests?.filter(r => r.status === 'rejected').length || 0

  const kpis = [
    { label: 'Total Listings', value: listings?.length || 0, icon: FiHome, color: 'from-blue-600 to-blue-800', change: '+2 this month' },
    { label: 'Total Views', value: totalViews, icon: FiEye, color: 'from-orange-500 to-orange-700', change: 'across all listings' },
    { label: 'Visit Requests', value: requests?.length || 0, icon: FiCalendar, color: 'from-purple-500 to-purple-700', change: `${pending} pending` },
    { label: 'Approved Visits', value: approved, icon: FiTrendingUp, color: 'from-emerald-500 to-emerald-700', change: `${rejected} rejected` },
  ]

  // Views per listing chart
  const viewsData = {
    labels: listings?.slice(0, 8).map(p => p.title.slice(0, 14) + '…') || [],
    datasets: [{
      label: 'Views',
      data: listings?.slice(0, 8).map(p => p.views || 0) || [],
      backgroundColor: listings?.slice(0, 8).map((_, i) => `hsla(${210 + i * 15}, 80%, 55%, 0.75)`) || [],
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  // Booking status doughnut
  const bookingStatusData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        approved,
        pending,
        rejected,
        requests?.filter(r => r.status === 'completed').length || 0,
        requests?.filter(r => r.status === 'cancelled').length || 0,
      ],
      backgroundColor: ['#10b981', '#f97316', '#ef4444', '#3b82f6', '#64748b'],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  }

  // Price distribution
  const priceRanges = [
    { label: '<$500k', min: 0, max: 500000 },
    { label: '$500k–1M', min: 500000, max: 1000000 },
    { label: '$1M–2M', min: 1000000, max: 2000000 },
    { label: '>$2M', min: 2000000, max: Infinity },
  ]
  const priceDistData = {
    labels: priceRanges.map(r => r.label),
    datasets: [{
      label: 'Listings',
      data: priceRanges.map(r =>
        listings?.filter(p => p.price >= r.min && p.price < r.max).length || 0
      ),
      backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(249,115,22,0.8)', 'rgba(139,92,246,0.8)', 'rgba(244,63,94,0.8)'],
      borderRadius: 8,
    }]
  }

  const baseOpts = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } } },
      tooltip: chartTooltip,
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Analytics</h1>
        <p className="text-slate-400 mt-1">Performance overview for your listings</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="text-white text-lg" />
            </div>
            <p className="text-2xl font-display font-bold text-white">{k.value.toLocaleString()}</p>
            <p className="text-slate-500 text-sm mt-1">{k.label}</p>
            <p className="text-blue-400 text-xs mt-1 flex items-center gap-1">
              <FiArrowUp className="text-xs" />{k.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">Views per Listing</h3>
          <p className="text-slate-500 text-xs mb-4">How many views each property has received</p>
          {listings?.length > 0 ? (
            <Bar data={viewsData} options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }} />
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No listings yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 flex flex-col items-center">
          <h3 className="font-semibold text-white mb-1 self-start">Booking Status Breakdown</h3>
          <p className="text-slate-500 text-xs mb-4 self-start">Distribution of visit request statuses</p>
          {requests?.length > 0 ? (
            <div style={{ maxWidth: 240 }}>
              <Doughnut
                data={bookingStatusData}
                options={{
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, padding: 10 } },
                    tooltip: chartTooltip,
                  },
                  cutout: '60%',
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No booking data yet</div>
          )}
        </motion.div>
      </div>

      {/* Price distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-white mb-1">Price Distribution</h3>
          <p className="text-slate-500 text-xs mb-4">How your listings are distributed across price ranges</p>
          <Bar data={priceDistData} options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }} />
        </motion.div>

        {/* Listing status summary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Listing Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Available', count: listings?.filter(p => p.status === 'available').length || 0, color: 'bg-emerald-400' },
              { label: 'Sold', count: listings?.filter(p => p.status === 'sold').length || 0, color: 'bg-red-400' },
              { label: 'Rented', count: listings?.filter(p => p.status === 'rented').length || 0, color: 'bg-orange-400' },
              { label: 'Pending', count: listings?.filter(p => p.status === 'pending').length || 0, color: 'bg-yellow-400' },
              { label: 'Off Market', count: listings?.filter(p => p.status === 'off_market').length || 0, color: 'bg-slate-400' },
            ].map(s => {
              const total = listings?.length || 1
              const pct = Math.round((s.count / total) * 100)
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{s.label}</span>
                    <span className="text-white font-semibold text-sm">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-slate-500 text-xs mb-3">Featured & Trending</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{listings?.filter(p => p.isFeatured).length || 0}</p>
                <p className="text-slate-500 text-xs mt-0.5">⭐ Featured</p>
              </div>
              <div className="bg-orange-500/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-400">{listings?.filter(p => p.isTrending).length || 0}</p>
                <p className="text-slate-500 text-xs mt-0.5">🔥 Trending</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top performing listing */}
      {listings?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">All Listings Performance</h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {[...listings].sort((a, b) => (b.views || 0) - (a.views || 0)).map((p, i) => {
                  const maxViews = listings.reduce((m, x) => Math.max(m, x.views || 0), 1)
                  const pct = Math.round(((p.views || 0) / maxViews) * 100)
                  return (
                    <tr key={p._id}>
                      <td>
                        <Link to={`/properties/${p._id}`} className="text-white text-sm font-medium hover:text-blue-400 transition-colors line-clamp-1 max-w-52 block">
                          {p.title}
                        </Link>
                      </td>
                      <td className="text-slate-400 text-sm capitalize">{p.propertyType}</td>
                      <td className="text-blue-400 font-semibold text-sm">{formatPrice(p.price, p.priceType)}</td>
                      <td><span className={`badge text-xs ${getStatusColor(p.status)}`}>{p.status}</span></td>
                      <td className="text-white font-bold text-sm">{(p.views || 0).toLocaleString()}</td>
                      <td style={{ minWidth: 120 }}>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-slate-500 text-xs">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
