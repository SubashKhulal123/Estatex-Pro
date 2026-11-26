import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiDroplet, FiMaximize, FiHeart, FiMapPin, FiEye } from 'react-icons/fi'
import { formatPrice, getStatusColor, getPropertyImage } from '../../utils/helpers'
import { propertyAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function PropertyCard({ property, index = 0, onSaveToggle }) {
  const { user } = useAuth()
  const [saved,  setSaved]  = useState(user?.savedProperties?.map(String).includes(String(property._id)) || false)
  const [saving, setSaving] = useState(false)

  const imgUrl = getPropertyImage(property, index)

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login to save properties'); return }
    setSaving(true)
    try {
      const { data } = await propertyAPI.toggleSave(property._id)
      setSaved(data.saved)
      toast.success(data.message)
      onSaveToggle?.()
    } catch {
      toast.error('Failed to save property')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/properties/${property._id}`}>
        <div className="property-card group">
          {/* Image */}
          <div className="relative h-52 overflow-hidden bg-slate-800">
            <img
              src={imgUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[60%]">
              {property.isFeatured && <span className="badge badge-warning text-xs">⭐ Featured</span>}
              {property.isTrending && <span className="badge badge-error text-xs">🔥 Trending</span>}
            </div>

            {/* Status */}
            <div className="absolute top-3 right-10">
              <span className={`badge text-xs ${getStatusColor(property.status)}`}>{property.status}</span>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`absolute top-3 right-3 w-7 h-7 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all ${
                saved ? 'bg-red-500 border-red-500 text-white' : 'bg-black/40 border-white/20 text-white hover:bg-red-500/30'
              }`}
            >
              <FiHeart className={`text-xs ${saved ? 'fill-current' : ''}`} />
            </button>

            {/* Price */}
            <div className="absolute bottom-3 left-3">
              <div className="price-tag text-sm">{formatPrice(property.price, property.priceType)}</div>
            </div>

            {/* Views */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/60 text-xs">
              <FiEye />{property.views || 0}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white text-base mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
              <FiMapPin className="text-orange-400 flex-shrink-0 text-xs" />
              <span className="truncate">{property.address}, {property.city}</span>
            </div>

            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center gap-3">
                  {property.bedrooms > 0 && (
                    <span className="flex items-center gap-1"><FiHome className="text-blue-400" />{property.bedrooms} bed</span>
                  )}
                  {property.bathrooms > 0 && (
                    <span className="flex items-center gap-1"><FiDroplet className="text-blue-400" />{property.bathrooms} bath</span>
                  )}
                  <span className="flex items-center gap-1"><FiMaximize className="text-blue-400" />{property.area?.toLocaleString()} {property.areaUnit}</span>
                </div>
                <span className="capitalize bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-xs">{property.propertyType}</span>
              </div>
            </div>

            {property.agent && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {property.agent.avatar
                    ? <img src={property.agent.avatar} alt="" className="w-full h-full object-cover" />
                    : property.agent.firstName?.[0]}
                </div>
                <span className="text-xs text-slate-500 truncate">{property.agent.firstName} {property.agent.lastName}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
