import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCheck, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import { formatDateTime } from '../../utils/helpers'

const ICON_MAP = {
  success: { icon: FiCheckCircle,  cls: 'text-emerald-400 bg-emerald-400/10' },
  error:   { icon: FiAlertCircle,  cls: 'text-red-400 bg-red-400/10' },
  warning: { icon: FiAlertTriangle,cls: 'text-orange-400 bg-orange-400/10' },
  info:    { icon: FiInfo,         cls: 'text-blue-400 bg-blue-400/10' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)
  const qc              = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => userAPI.getNotifications(),
    select:   d => d.data.notifications || [],
    refetchInterval: 30000, // poll every 30s
  })

  const unread = notifications.filter(n => !n.isRead).length

  const markRead = useMutation({
    mutationFn: (id) => userAPI.markRead(id),
    onSuccess:  () => qc.invalidateQueries(['notifications']),
  })

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id)
    await Promise.all(unreadIds.map(id => userAPI.markRead(id)))
    qc.invalidateQueries(['notifications'])
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
      >
        <FiBell className="text-xl" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 glass-card shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FiBell className="text-blue-400" />
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">{unread}</span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <FiCheck className="text-xs" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <FiBell className="text-3xl text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 15).map((n) => {
                  const { icon: Icon, cls } = ICON_MAP[n.type] || ICON_MAP.info
                  return (
                    <div
                      key={n._id}
                      onClick={() => { if (!n.isRead) markRead.mutate(n._id) }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/3 cursor-pointer transition-colors ${
                        n.isRead ? 'opacity-60' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
                        <Icon className="text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.isRead ? 'text-slate-400' : 'text-white'}`}>
                          {n.message}
                        </p>
                        <p className="text-slate-600 text-xs mt-0.5">{formatDateTime(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {notifications.length > 15 && (
              <div className="px-4 py-2 border-t border-white/5 text-center">
                <p className="text-slate-500 text-xs">Showing 15 of {notifications.length}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
