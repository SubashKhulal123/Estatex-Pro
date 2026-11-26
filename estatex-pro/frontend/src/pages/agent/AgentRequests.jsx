import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiCalendar, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi'
import { bookingAPI } from '../../services/api'
import { formatDate, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=80&auto=format&fit=crop'

export default function AgentRequests() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [noteModal, setNoteModal] = useState(null)
  const [notes, setNotes] = useState('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['agent-requests'],
    queryFn: () => bookingAPI.agentRequests(),
    select: d => d.data.bookings,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, agentNotes, rejectionReason }) =>
      bookingAPI.updateStatus(id, { status, agentNotes, rejectionReason }),
    onSuccess: (d) => {
      toast.success(d.data.message)
      qc.invalidateQueries(['agent-requests'])
      setNoteModal(null)
      setNotes('')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed')
  })

  const handleApprove = (id) => {
    updateMutation.mutate({ id, status: 'approved', agentNotes: notes })
  }

  const handleReject = (id) => {
    if (!notes.trim()) { toast.error('Please provide a rejection reason'); return }
    updateMutation.mutate({ id, status: 'rejected', rejectionReason: notes })
  }

  const filtered = bookings?.filter(b => filter === 'all' || b.status === filter) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Visit Requests</h1>
        <p className="text-slate-400 mt-1">{bookings?.length || 0} total requests</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === f ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && bookings?.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Property thumbnail */}
                <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
                  <img src={b.property?.thumbnail?.startsWith('http') ? b.property.thumbnail : FALLBACK_IMG} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{b.property?.title}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{b.property?.city}</p>
                    </div>
                    <span className={`badge text-xs ${getStatusColor(b.status)}`}>{b.status}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs">
                        {b.customer?.firstName?.[0]}
                      </div>
                      {b.customer?.firstName} {b.customer?.lastName}
                    </span>
                    <span className="flex items-center gap-1"><FiCalendar />{formatDate(b.visitDate)} at {b.visitTime}</span>
                    {b.customer?.phone && <span>📞 {b.customer.phone}</span>}
                  </div>

                  {b.message && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                      <p className="text-slate-400 text-xs italic">"{b.message}"</p>
                    </div>
                  )}

                  {b.agentNotes && (
                    <p className="mt-2 text-xs text-emerald-400">Note: {b.agentNotes}</p>
                  )}
                  {b.rejectionReason && (
                    <p className="mt-2 text-xs text-red-400">Reason: {b.rejectionReason}</p>
                  )}
                </div>

                {/* Actions */}
                {b.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setNoteModal({ id: b._id, action: 'approve' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => setNoteModal({ id: b._id, action: 'reject' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-colors"
                    >
                      <FiX /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card">
          <FiCalendar className="text-4xl text-slate-600 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-white mb-2">No {filter !== 'all' ? filter : ''} requests</h3>
          <p className="text-slate-500 text-sm">Visit requests from customers will appear here</p>
        </div>
      )}

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold text-white mb-2">
              {noteModal.action === 'approve' ? '✅ Approve Visit' : '❌ Reject Visit'}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {noteModal.action === 'approve' ? 'Add an optional note for the customer.' : 'Please provide a reason for rejection.'}
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={noteModal.action === 'approve' ? 'e.g. Meet at the main entrance...' : 'e.g. Property already booked for that time...'}
              rows={3}
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNotes('') }} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button
                onClick={() => noteModal.action === 'approve' ? handleApprove(noteModal.id) : handleReject(noteModal.id)}
                disabled={updateMutation.isPending}
                className={`flex-1 justify-center ${noteModal.action === 'approve' ? 'btn-primary' : 'btn-accent'}`}
                style={noteModal.action === 'reject' ? {} : {}}
              >
                {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (noteModal.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
