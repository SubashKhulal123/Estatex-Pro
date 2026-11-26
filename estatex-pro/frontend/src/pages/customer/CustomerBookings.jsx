import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiCalendar, FiX, FiPhone, FiMail } from 'react-icons/fi'
import { bookingAPI } from '../../services/api'
import { formatDate, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=120&auto=format&fit=crop'

export default function CustomerBookings() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.myBookings(),
    select: d => d.data.bookings,
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => bookingAPI.cancel(id),
    onSuccess: () => { toast.success('Booking cancelled'); qc.invalidateQueries(['my-bookings']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Cancel failed')
  })

  const filtered = bookings?.filter(b => filter === 'all' || b.status === filter) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Bookings</h1>
        <p className="text-slate-400 mt-1">{bookings?.length || 0} total booking requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === f ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
                  <img src={b.property?.thumbnail?.startsWith('http') ? b.property.thumbnail : FALLBACK_IMG} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <Link to={`/properties/${b.property?._id}`} className="font-semibold text-white hover:text-blue-400 transition-colors">{b.property?.title}</Link>
                    <span className={`badge text-xs ${getStatusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><FiCalendar />{formatDate(b.visitDate)} at {b.visitTime}</span>
                    <span>📍 {b.property?.city}</span>
                  </div>
                  {b.message && <p className="text-slate-500 text-xs italic mb-2">"{b.message}"</p>}
                  {b.agentNotes && <p className="text-emerald-400 text-xs">Agent note: {b.agentNotes}</p>}
                  {b.rejectionReason && <p className="text-red-400 text-xs">Reason: {b.rejectionReason}</p>}

                  {/* Agent contact */}
                  {b.agent && b.status === 'approved' && (
                    <div className="mt-3 flex items-center gap-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-xs font-bold">
                        {b.agent.firstName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-xs font-medium">{b.agent.firstName} {b.agent.lastName}</p>
                        <div className="flex gap-3 mt-0.5">
                          {b.agent.phone && <a href={`tel:${b.agent.phone}`} className="text-emerald-400 text-xs flex items-center gap-1"><FiPhone />{b.agent.phone}</a>}
                          <a href={`mailto:${b.agent.email}`} className="text-emerald-400 text-xs flex items-center gap-1"><FiMail />{b.agent.email}</a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {['pending', 'approved'].includes(b.status) && (
                  <button
                    onClick={() => { if (confirm('Cancel this booking?')) cancelMutation.mutate(b._id) }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
                  >
                    <FiX /> Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card">
          <FiCalendar className="text-4xl text-slate-600 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-white mb-2">No bookings found</h3>
          <p className="text-slate-500 text-sm mb-4">Book a visit to a property to see it here</p>
          <Link to="/properties" className="btn-primary">Browse Properties</Link>
        </div>
      )}
    </div>
  )
}
