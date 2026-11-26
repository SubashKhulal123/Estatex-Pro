import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import { propertyAPI } from '../../services/api'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=120&auto=format&fit=crop'

export default function AgentListings() {
  const qc = useQueryClient()

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => propertyAPI.myListings(),
    select: d => d.data.properties,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => propertyAPI.delete(id),
    onSuccess: () => { toast.success('Property deleted'); qc.invalidateQueries(['my-listings']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed')
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Listings</h1>
          <p className="text-slate-400 mt-1">{listings?.length || 0} properties</p>
        </div>
        <Link to="/dashboard/agent/add-property" className="btn-primary">
          <FiPlus /> Add Property
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : listings?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card overflow-hidden group">
              <div className="relative h-36 overflow-hidden">
                <img src={p.thumbnail?.startsWith('http') ? p.thumbnail : FALLBACK_IMG} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.src = FALLBACK_IMG }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <span className={`absolute top-2 right-2 badge text-xs ${getStatusColor(p.status)}`}>{p.status}</span>
                <div className="absolute bottom-2 left-2">
                  <p className="text-white font-bold text-sm">{formatPrice(p.price, p.priceType)}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">{p.title}</h3>
                <p className="text-slate-500 text-xs mb-3">{p.city}, {p.country}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <span>👁 {p.views || 0}</span>
                    <span className="text-slate-700">•</span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/properties/${p._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                      <FiEye className="text-sm" />
                    </Link>
                    <Link to={`/dashboard/agent/edit-property/${p._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors">
                      <FiEdit2 className="text-sm" />
                    </Link>
                    <button onClick={() => { if (confirm('Delete this property?')) deleteMutation.mutate(p._id) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">No listings yet</h3>
          <p className="text-slate-400 mb-6">Start by adding your first property listing</p>
          <Link to="/dashboard/agent/add-property" className="btn-primary">
            <FiPlus /> Add Property
          </Link>
        </div>
      )}
    </div>
  )
}
