import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiCalendar, FiSearch } from 'react-icons/fi'
import { bookingAPI } from '../../services/api'
import { formatDate, formatDateTime, getStatusColor } from '../../utils/helpers'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=80&auto=format&fit=crop'

export default function AdminBookings() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', status, page],
    queryFn: () => bookingAPI.getAll({ status: status || undefined, page, limit: 15 }),
    select: d => d.data,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Bookings</h1>
        <p className="text-slate-400 mt-1">{data?.total || 0} total booking requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: data?.total || 0, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Pending', val: data?.bookings?.filter(b => b.status === 'pending').length || 0, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Approved', val: data?.bookings?.filter(b => b.status === 'approved').length || 0, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Rejected', val: data?.bookings?.filter(b => b.status === 'rejected').length || 0, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field w-40 h-10 text-sm">
          <option value="">All Status</option>
          {['pending','approved','rejected','completed','cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Customer</th>
                <th>Agent</th>
                <th>Visit Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>)
              ) : data?.bookings?.length > 0 ? data.bookings.map(b => (
                <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                        <img src={b.property?.thumbnail?.startsWith('http') ? b.property.thumbnail : FALLBACK_IMG} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG }} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-1 max-w-36">{b.property?.title}</p>
                        <p className="text-slate-500 text-xs">{b.property?.city}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-white text-sm">{b.customer?.firstName} {b.customer?.lastName}</p>
                    <p className="text-slate-500 text-xs">{b.customer?.email}</p>
                  </td>
                  <td className="text-slate-400 text-sm">{b.agent?.firstName} {b.agent?.lastName}</td>
                  <td className="text-slate-400 text-sm">{formatDate(b.visitDate)}</td>
                  <td className="text-slate-400 text-sm">{b.visitTime}</td>
                  <td><span className={`badge text-xs ${getStatusColor(b.status)}`}>{b.status}</span></td>
                  <td className="text-slate-400 text-sm">{formatDate(b.createdAt)}</td>
                </motion.tr>
              )) : (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
