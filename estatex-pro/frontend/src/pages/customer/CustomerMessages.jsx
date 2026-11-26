import { motion } from 'framer-motion'
import { FiMessageSquare, FiSend, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    agent: 'James Wilson',
    initials: 'JW',
    property: 'Luxury Ocean View Villa',
    lastMessage: 'Sure! I can schedule a viewing for you this Saturday at 10 AM.',
    time: '2h ago',
    unread: 2,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 2,
    agent: 'Sarah Davis',
    initials: 'SD',
    property: 'Cozy Family Home in Suburbs',
    lastMessage: 'The property has been recently renovated. Let me know if you have questions.',
    time: '1d ago',
    unread: 0,
    color: 'from-orange-500 to-orange-700',
  },
  {
    id: 3,
    agent: 'James Wilson',
    initials: 'JW',
    property: 'Waterfront Condo with Marina',
    lastMessage: 'Thank you for your interest! The listing is still available.',
    time: '3d ago',
    unread: 0,
    color: 'from-blue-600 to-blue-800',
  },
]

export default function CustomerMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Messages</h1>
        <p className="text-slate-400 mt-1">Your conversations with agents</p>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search conversations..." className="input-field pl-11 h-11" />
      </div>

      {/* Conversation list */}
      <div className="space-y-3">
        {MOCK_CONVERSATIONS.map((conv, i) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 cursor-pointer hover:border-blue-500/20 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${conv.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {conv.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-white font-semibold text-sm">{conv.agent}</p>
                  <span className="text-slate-500 text-xs">{conv.time}</span>
                </div>
                <p className="text-blue-400 text-xs mb-1">{conv.property}</p>
                <p className="text-slate-400 text-sm line-clamp-1">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {conv.unread}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 border-blue-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
            <FiMessageSquare className="text-blue-400 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Direct Messaging Coming Soon</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full real-time messaging with agents is under development. For now, you can contact agents directly via the property detail page or by booking a visit.
            </p>
            <Link to="/properties" className="btn-primary text-sm py-2 mt-3 inline-flex">
              Browse Properties
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
