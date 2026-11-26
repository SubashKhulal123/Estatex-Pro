import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiDownload, FiFileText, FiUsers, FiHome, FiCalendar, FiCheckCircle } from 'react-icons/fi'
import { userAPI, propertyAPI, bookingAPI } from '../../services/api'
import { formatDate, formatPrice, getRoleLabel, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ── CSV helpers ───────────────────────────────────────────────────────────────
const toCSV = (rows, cols) => {
  const header = cols.map(c => c.label).join(',')
  const body   = rows.map(r =>
    cols.map(c => {
      const val = c.fn(r) ?? ''
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    }).join(',')
  ).join('\n')
  return `${header}\n${body}`
}

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
  toast.success(`${filename} downloaded!`)
}

export default function AdminReports() {
  const [generating, setGenerating] = useState('')

  const { data: platform } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn:  () => userAPI.platformAnalytics(),
    select:   d => d.data.analytics,
  })

  const { data: propData } = useQuery({
    queryKey: ['property-analytics'],
    queryFn:  () => propertyAPI.analytics(),
    select:   d => d.data.analytics,
  })

  const handleExport = async (type) => {
    setGenerating(type)
    try {
      if (type === 'users') {
        const { data } = await userAPI.getAll({ limit: 1000 })
        const cols = [
          { label: 'First Name',  fn: r => r.firstName },
          { label: 'Last Name',   fn: r => r.lastName  },
          { label: 'Email',       fn: r => r.email     },
          { label: 'Role',        fn: r => getRoleLabel(r.role) },
          { label: 'Status',      fn: r => r.isActive ? 'Active' : 'Inactive' },
          { label: 'City',        fn: r => r.city      },
          { label: 'Country',     fn: r => r.country   },
          { label: 'Joined',      fn: r => formatDate(r.createdAt) },
        ]
        downloadCSV(toCSV(data.users, cols), `estatex_users_${Date.now()}.csv`)
      }

      if (type === 'properties') {
        const { data } = await propertyAPI.getAll({ limit: 1000, status: '' })
        const cols = [
          { label: 'Title',         fn: r => r.title },
          { label: 'Type',          fn: r => r.propertyType },
          { label: 'Category',      fn: r => r.category },
          { label: 'Price',         fn: r => r.price },
          { label: 'Listing Type',  fn: r => r.priceType },
          { label: 'Status',        fn: r => r.status },
          { label: 'City',          fn: r => r.city },
          { label: 'Country',       fn: r => r.country },
          { label: 'Bedrooms',      fn: r => r.bedrooms },
          { label: 'Bathrooms',     fn: r => r.bathrooms },
          { label: 'Area',          fn: r => `${r.area} ${r.areaUnit}` },
          { label: 'Views',         fn: r => r.views },
          { label: 'Featured',      fn: r => r.isFeatured ? 'Yes' : 'No' },
          { label: 'Listed Date',   fn: r => formatDate(r.createdAt) },
        ]
        downloadCSV(toCSV(data.properties, cols), `estatex_properties_${Date.now()}.csv`)
      }

      if (type === 'bookings') {
        const { data } = await bookingAPI.getAll({ limit: 1000 })
        const cols = [
          { label: 'Property',       fn: r => r.property?.title   },
          { label: 'City',           fn: r => r.property?.city    },
          { label: 'Customer',       fn: r => `${r.customer?.firstName} ${r.customer?.lastName}` },
          { label: 'Customer Email', fn: r => r.customer?.email   },
          { label: 'Agent',          fn: r => `${r.agent?.firstName} ${r.agent?.lastName}` },
          { label: 'Visit Date',     fn: r => formatDate(r.visitDate) },
          { label: 'Visit Time',     fn: r => r.visitTime },
          { label: 'Status',         fn: r => r.status },
          { label: 'Message',        fn: r => r.message },
          { label: 'Requested On',   fn: r => formatDate(r.createdAt) },
        ]
        downloadCSV(toCSV(data.bookings, cols), `estatex_bookings_${Date.now()}.csv`)
      }
    } catch (err) {
      toast.error('Export failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setGenerating('')
    }
  }

  const reportCards = [
    {
      type:  'users',
      icon:  FiUsers,
      color: 'from-blue-600 to-blue-800',
      title: 'Users Report',
      desc:  'All registered users with roles, status, and join dates',
      count: platform?.totalUsers || 0,
      label: 'Total Users',
    },
    {
      type:  'properties',
      icon:  FiHome,
      color: 'from-orange-500 to-orange-700',
      title: 'Properties Report',
      desc:  'All listings with prices, statuses, and performance metrics',
      count: propData?.total || 0,
      label: 'Total Properties',
    },
    {
      type:  'bookings',
      icon:  FiCalendar,
      color: 'from-emerald-500 to-emerald-700',
      title: 'Bookings Report',
      desc:  'All visit requests with customer, agent, and status info',
      count: platform?.totalBookings || 0,
      label: 'Total Bookings',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Reports & Exports</h1>
        <p className="text-slate-400 mt-1">Generate and download platform data as CSV files</p>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {reportCards.map((r, i) => (
          <motion.div
            key={r.type}
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center`}>
                <r.icon className="text-white text-xl" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold text-white">{r.count.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">{r.label}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{r.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
            </div>
            <button
              onClick={() => handleExport(r.type)}
              disabled={!!generating}
              className={`btn-primary justify-center py-2.5 mt-auto ${generating === r.type ? 'opacity-75' : ''}`}
            >
              {generating === r.type
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
                : <><FiDownload /> Export CSV</>}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Platform summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property breakdown */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <FiHome className="text-blue-400" /> Property Summary
          </h3>
          <div className="space-y-3">
            {[
              { label:'Total Listed',  val: propData?.total      || 0, pct: 100 },
              { label:'Available',     val: propData?.available  || 0, pct: propData?.total ? Math.round(propData.available/propData.total*100) : 0, color:'bg-emerald-400' },
              { label:'Sold',          val: propData?.sold       || 0, pct: propData?.total ? Math.round(propData.sold/propData.total*100)     : 0, color:'bg-red-400' },
              { label:'Rented',        val: propData?.rented     || 0, pct: propData?.total ? Math.round(propData.rented/propData.total*100)   : 0, color:'bg-orange-400' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="text-slate-300">{s.label}</span>
                  <span className="text-white font-bold">{s.val.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color || 'bg-blue-500'} rounded-full`} style={{ width:`${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3">Top Cities</h4>
            <div className="space-y-2">
              {propData?.byCity?.slice(0,5).map(c => (
                <div key={c._id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">📍 {c._id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-medium">{c.count} listings</span>
                    <span className="text-slate-500 text-xs">avg {formatPrice(c.avgPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* User & booking breakdown */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <FiUsers className="text-orange-400" /> User & Booking Summary
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {platform?.usersByRole?.map(r => (
              <div key={r._id} className="bg-white/3 rounded-xl p-3">
                <p className="text-xl font-display font-bold text-white">{r.count}</p>
                <p className="text-slate-500 text-xs mt-0.5">{getRoleLabel(r._id)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-3">Booking Status</h4>
            <div className="space-y-2">
              {[
                { label:'Total Requests', val: platform?.totalBookings || 0,   color:'text-white' },
                { label:'Pending',        val: platform?.pendingBookings || 0,  color:'text-orange-400' },
                { label:'Approved',       val: (platform?.totalBookings || 0) - (platform?.pendingBookings || 0), color:'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <FiCheckCircle />
              <span className="font-medium text-sm">Platform Health</span>
            </div>
            <p className="text-slate-400 text-xs">
              {propData?.available || 0} properties available · {platform?.totalUsers || 0} active users · {platform?.pendingBookings || 0} pending bookings
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
