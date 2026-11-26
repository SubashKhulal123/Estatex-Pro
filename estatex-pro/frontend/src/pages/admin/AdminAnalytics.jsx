import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiHome, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement, Filler,
  RadialLinearScale
} from 'chart.js'
import { userAPI, propertyAPI } from '../../services/api'
import { getRoleLabel } from '../../utils/helpers'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler, RadialLinearScale
)

const chartOpts = (title) => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } } },
    title: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
    }
  },
  scales: {
    x: { ticks: { color: '#64748b', font: { family: 'DM Sans' } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b', font: { family: 'DM Sans' } }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
})

export default function AdminAnalytics() {
  const { data: platform } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: () => userAPI.platformAnalytics(),
    select: d => d.data.analytics,
  })

  const { data: props } = useQuery({
    queryKey: ['property-analytics'],
    queryFn: () => propertyAPI.analytics(),
    select: d => d.data.analytics,
  })

  // Monthly bookings chart
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyData = [...(platform?.monthlyBookings || [])].reverse()

  const bookingsTrendData = {
    labels: monthlyData.map(m => `${monthNames[m._id.month - 1]} ${m._id.year}`),
    datasets: [{
      label: 'Bookings',
      data: monthlyData.map(m => m.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  }

  // Properties by type
  const propTypeData = {
    labels: props?.byType?.map(t => t._id?.charAt(0).toUpperCase() + t._id?.slice(1)) || [],
    datasets: [{
      label: 'Count',
      data: props?.byType?.map(t => t.count) || [],
      backgroundColor: [
        'rgba(59,130,246,0.8)', 'rgba(249,115,22,0.8)', 'rgba(16,185,129,0.8)',
        'rgba(139,92,246,0.8)', 'rgba(244,63,94,0.8)', 'rgba(6,182,212,0.8)',
        'rgba(132,204,22,0.8)', 'rgba(245,158,11,0.8)'
      ],
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  // Users by role doughnut
  const userRoleData = {
    labels: platform?.usersByRole?.map(r => getRoleLabel(r._id)) || [],
    datasets: [{
      data: platform?.usersByRole?.map(r => r.count) || [],
      backgroundColor: ['#ef4444','#f97316','#3b82f6','#8b5cf6','#10b981'],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  }

  // City performance
  const cityData = {
    labels: props?.byCity?.slice(0, 7).map(c => c._id) || [],
    datasets: [
      {
        label: 'Properties',
        data: props?.byCity?.slice(0, 7).map(c => c.count) || [],
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Avg Price ($k)',
        data: props?.byCity?.slice(0, 7).map(c => Math.round((c.avgPrice || 0) / 1000)) || [],
        backgroundColor: 'rgba(249,115,22,0.7)',
        borderRadius: 6,
        yAxisID: 'y1',
      }
    ]
  }

  const cityOpts = {
    ...chartOpts(),
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { type: 'linear', position: 'left', ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y1: { type: 'linear', position: 'right', ticks: { color: '#64748b', callback: v => `$${v}k` }, grid: { display: false } }
    },
    plugins: { ...chartOpts().plugins, legend: { labels: { color: '#94a3b8' } } }
  }

  // Property status radar
  const statusRadarData = {
    labels: ['Available', 'Sold', 'Rented', 'Pending', 'Featured', 'Trending'],
    datasets: [{
      label: 'Properties',
      data: [
        props?.available || 0,
        props?.sold || 0,
        props?.rented || 0,
        (props?.total || 0) - (props?.available || 0) - (props?.sold || 0) - (props?.rented || 0),
        props?.byType?.length || 0,
        props?.topViewed?.length || 0,
      ],
      backgroundColor: 'rgba(59,130,246,0.15)',
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#1e40af',
    }]
  }

  const kpiCards = [
    { label: 'Total Revenue (est.)', value: props?.byCity?.reduce((s, c) => s + c.avgPrice, 0) ? `$${(props.byCity.reduce((s, c) => s + c.avgPrice, 0) / 1000).toFixed(0)}k` : 'N/A', icon: FiDollarSign, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Total Properties', value: props?.total || 0, icon: FiHome, color: 'from-blue-600 to-blue-800' },
    { label: 'Total Users', value: platform?.totalUsers || 0, icon: FiUsers, color: 'from-orange-500 to-orange-700' },
    { label: 'Total Bookings', value: platform?.totalBookings || 0, icon: FiCalendar, color: 'from-purple-500 to-purple-700' },
    { label: 'Sold Properties', value: props?.sold || 0, icon: FiTrendingUp, color: 'from-rose-500 to-rose-700' },
    { label: 'Properties Rented', value: props?.rented || 0, icon: FiHome, color: 'from-cyan-500 to-cyan-700' },
    { label: 'Pending Bookings', value: platform?.pendingBookings || 0, icon: FiCalendar, color: 'from-amber-500 to-amber-700' },
    { label: 'Available Now', value: props?.available || 0, icon: FiHome, color: 'from-teal-500 to-teal-700' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Platform Analytics</h1>
        <p className="text-slate-400 mt-1">Comprehensive overview of platform performance</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="text-white text-base" />
            </div>
            <p className="text-2xl font-display font-bold text-white">{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</p>
            <p className="text-slate-500 text-xs mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Booking trend + city performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">Booking Trends</h3>
          <p className="text-slate-500 text-xs mb-4">Monthly booking volume</p>
          {monthlyData.length > 0 ? (
            <Line data={bookingsTrendData} options={chartOpts('Booking Trends')} />
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No booking data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">City Performance</h3>
          <p className="text-slate-500 text-xs mb-4">Properties listed & average price per city</p>
          {props?.byCity?.length > 0 ? (
            <Bar data={cityData} options={cityOpts} />
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No city data yet</div>
          )}
        </motion.div>
      </div>

      {/* Property types + user roles + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Property Types</h3>
          {props?.byType?.length > 0 ? (
            <Bar data={propTypeData} options={{ ...chartOpts(), plugins: { legend: { display: false }, tooltip: chartOpts().plugins.tooltip } }} />
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="glass-card p-6 flex flex-col items-center">
          <h3 className="font-semibold text-white mb-4 self-start">Users by Role</h3>
          {platform?.usersByRole?.length > 0 ? (
            <div style={{ maxWidth: 220 }}>
              <Doughnut
                data={userRoleData}
                options={{
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, padding: 10 } },
                    tooltip: chartOpts().plugins.tooltip
                  },
                  cutout: '60%',
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6 flex flex-col items-center">
          <h3 className="font-semibold text-white mb-4 self-start">Property Radar</h3>
          <Radar
            data={statusRadarData}
            options={{
              plugins: { legend: { display: false }, tooltip: chartOpts().plugins.tooltip },
              scales: {
                r: {
                  ticks: { color: '#64748b', backdropColor: 'transparent', font: { size: 10 } },
                  grid: { color: 'rgba(255,255,255,0.06)' },
                  angleLines: { color: 'rgba(255,255,255,0.06)' },
                  pointLabels: { color: '#94a3b8', font: { size: 11 } },
                }
              }
            }}
          />
        </motion.div>
      </div>

      {/* Top viewed properties table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Top Viewed Properties</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Property</th>
                <th>City</th>
                <th>Price</th>
                <th>Views</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {props?.topViewed?.map((p, i) => {
                const maxViews = props.topViewed[0]?.views || 1
                const pct = Math.round((p.views / maxViews) * 100)
                return (
                  <tr key={p._id}>
                    <td className="text-slate-500 text-sm font-bold">#{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                          <img src={p.thumbnail?.startsWith('http') ? p.thumbnail : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=80&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=80&auto=format&fit=crop' }} />
                        </div>
                        <span className="text-white text-sm font-medium line-clamp-1 max-w-48">{p.title}</span>
                      </div>
                    </td>
                    <td className="text-slate-400 text-sm">{p.city}</td>
                    <td className="text-blue-400 font-semibold text-sm">${(p.price / 1000).toFixed(0)}k</td>
                    <td className="text-white font-bold text-sm">{p.views?.toLocaleString()}</td>
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
    </div>
  )
}
