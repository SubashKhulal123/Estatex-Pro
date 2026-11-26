import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiHeart, FiMapPin, FiHome, FiDroplet, FiMaximize } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { propertyAPI } from '../../services/api'
import { formatPrice, getPropertyImage, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

export function SavedProperties() {
  const { user, fetchMe } = useAuth()

  const unsaveMutation = useMutation({
    mutationFn: (id) => propertyAPI.toggleSave(id),
    onSuccess: () => { toast.success('Removed from saved'); fetchMe() },
    onError:   () => toast.error('Failed to remove'),
  })

  const savedProps = user?.savedProperties || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Saved Properties</h1>
        <p className="text-slate-400 mt-1">{savedProps.length} saved {savedProps.length === 1 ? 'property' : 'properties'}</p>
      </div>

      {savedProps.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <FiHeart className="text-4xl text-slate-600 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-white mb-2">No saved properties yet</h3>
          <p className="text-slate-500 text-sm mb-4">Browse properties and tap ♥ to save your favourites</p>
          <Link to="/properties" className="btn-primary">Browse Properties</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProps.map((p, i) => {
            // savedProperties can be either full objects (populated) or just IDs
            if (typeof p === 'string') {
              return (
                <div key={p} className="glass-card p-4 animate-pulse">
                  <div className="skeleton h-36 rounded-xl mb-3" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              )
            }
            const imgUrl = getPropertyImage(p, i)
            return (
              <motion.div
                key={p._id || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden group"
              >
                <div className="relative h-40 overflow-hidden bg-slate-800">
                  <img
                    src={imgUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&auto=format&fit=crop'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <button
                    onClick={() => unsaveMutation.mutate(p._id)}
                    disabled={unsaveMutation.isPending}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    title="Remove from saved"
                  >
                    <FiHeart className="fill-current text-sm" />
                  </button>
                  <div className="absolute bottom-2 left-2">
                    <div className="price-tag text-sm">{formatPrice(p.price, p.priceType)}</div>
                  </div>
                  {p.status && (
                    <span className={`absolute top-2 left-2 badge text-xs ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <Link to={`/properties/${p._id}`}>
                    <h3 className="text-white font-semibold text-sm line-clamp-1 hover:text-blue-400 transition-colors mb-1">
                      {p.title}
                    </h3>
                  </Link>
                  <p className="text-slate-500 text-xs flex items-center gap-1 mb-3">
                    <FiMapPin className="text-orange-400 flex-shrink-0" />
                    {p.city}, {p.country}
                  </p>
                  <div className="flex items-center gap-3 text-slate-500 text-xs border-t border-white/5 pt-2">
                    {p.bedrooms > 0  && <span className="flex items-center gap-1"><FiHome className="text-blue-400" />{p.bedrooms} bed</span>}
                    {p.bathrooms > 0 && <span className="flex items-center gap-1"><FiDroplet className="text-blue-400" />{p.bathrooms} bath</span>}
                    {p.area > 0      && <span className="flex items-center gap-1"><FiMaximize className="text-blue-400" />{p.area?.toLocaleString()} {p.areaUnit}</span>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
