import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  FiHome, FiDroplet, FiMaximize, FiMapPin, FiHeart, FiCalendar,
  FiPhone, FiMail, FiArrowLeft, FiEye, FiCheck, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { propertyAPI, bookingAPI } from '../../services/api'
import Navbar from '../../components/layout/Navbar'
import { formatPrice, formatDate, getStatusColor, getPropertyImage, FALLBACK_IMAGES } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']

export default function PropertyDetailPage() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const [selImg,       setSelImg]       = useState(0)
  const [saved,        setSaved]        = useState(false)
  const [bookingForm,  setBookingForm]  = useState({ visitDate:'', visitTime:'', message:'' })
  const [bookLoading,  setBookLoading]  = useState(false)

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn:  () => propertyAPI.getOne(id),
    select:   d => d.data.property,
  })

  /* ── Build image array ──────────────────────────────────────── */
  const getImages = () => {
    if (!property) return FALLBACK_IMAGES.slice(0,3)
    const raw = [...new Set([
      property.thumbnail,
      ...(property.images || []),
    ].filter(Boolean))]
    if (raw.length === 0) return FALLBACK_IMAGES.slice(0,3)
    return raw.map(url => url.startsWith('http') ? url : FALLBACK_IMAGES[0])
  }
  const images = getImages()

  const prevImg = () => setSelImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setSelImg(i => (i + 1) % images.length)

  /* ── Save ───────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!user) return toast.error('Please login to save')
    try {
      const { data } = await propertyAPI.toggleSave(id)
      setSaved(data.saved)
      toast.success(data.message)
    } catch { toast.error('Failed') }
  }

  /* ── Booking ────────────────────────────────────────────────── */
  const handleBooking = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!bookingForm.visitDate || !bookingForm.visitTime) {
      toast.error('Please select a date and time'); return
    }
    setBookLoading(true)
    try {
      await bookingAPI.create({ propertyId: id, ...bookingForm })
      toast.success('Visit request submitted! The agent will confirm shortly.')
      setBookingForm({ visitDate:'', visitTime:'', message:'' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBookLoading(false)
    }
  }

  /* ── Loading skeleton ───────────────────────────────────────── */
  if (isLoading) return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="skeleton h-96 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-10 w-2/3" />
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-32" />
          </div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  )

  if (!property) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🏠</p>
        <h2 className="text-2xl font-bold text-white mb-4">Property not found</h2>
        <button onClick={() => navigate('/properties')} className="btn-primary">Browse Properties</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 lg:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mt-4 mb-6 transition-colors group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Properties
          </button>

          {/* ── Hero gallery ── */}
          <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-900" style={{ height: 480 }}>
            <img
              key={images[selImg]}
              src={images[selImg]}
              alt={property.title}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGES[0] }}
            />
            {/* gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

            {/* nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                  <FiChevronLeft className="text-xl" />
                </button>
                <button onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                  <FiChevronRight className="text-xl" />
                </button>
              </>
            )}

            {/* image counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
              {selImg + 1} / {images.length}
            </div>

            {/* badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {property.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
              {property.isTrending && <span className="badge badge-error">🔥 Trending</span>}
            </div>
            <span className={`absolute top-4 right-4 badge ${getStatusColor(property.status)}`}>{property.status}</span>
          </div>

          {/* ── Thumbnails strip ── */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelImg(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selImg === i ? 'border-blue-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = FALLBACK_IMAGES[0] }} />
                </button>
              ))}
            </div>
          )}

          {/* ── Main content ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title & meta */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <h1 className="font-display text-3xl font-bold text-white leading-tight">{property.title}</h1>
                  <button onClick={handleSave}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                      saved ? 'bg-red-500 border-red-500 text-white' : 'border-white/20 text-slate-400 hover:border-red-400 hover:text-red-400'
                    }`}>
                    <FiHeart className={saved ? 'fill-current' : ''} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <FiMapPin className="text-orange-400 flex-shrink-0" />
                  <span>{property.address}, {property.city}{property.state ? `, ${property.state}` : ''}, {property.country}</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`badge ${getStatusColor(property.status)}`}>{property.status}</span>
                  <span className="badge badge-info capitalize">{property.propertyType}</span>
                  <span className="badge badge-purple capitalize">{property.category}</span>
                  <span className="flex items-center gap-1 text-slate-500 text-xs"><FiEye />{property.views?.toLocaleString()} views</span>
                </div>
              </div>

              {/* Price & stats */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Price</p>
                    <p className="text-3xl font-display font-bold text-white">{formatPrice(property.price, property.priceType)}</p>
                    {property.area > 0 && (
                      <p className="text-slate-500 text-sm mt-0.5">
                        ${Math.round(property.price / property.area).toLocaleString()} per {property.areaUnit}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-6 flex-wrap">
                    {property.bedrooms > 0 && (
                      <div className="text-center">
                        <FiHome className="text-blue-400 text-xl mx-auto mb-1" />
                        <p className="text-white font-bold text-lg leading-none">{property.bedrooms}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Beds</p>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="text-center">
                        <FiDroplet className="text-blue-400 text-xl mx-auto mb-1" />
                        <p className="text-white font-bold text-lg leading-none">{property.bathrooms}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Baths</p>
                      </div>
                    )}
                    <div className="text-center">
                      <FiMaximize className="text-blue-400 text-xl mx-auto mb-1" />
                      <p className="text-white font-bold text-lg leading-none">{property.area?.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{property.areaUnit}</p>
                    </div>
                    {property.parking > 0 && (
                      <div className="text-center">
                        <span className="text-blue-400 text-xl block mb-1">🚗</span>
                        <p className="text-white font-bold text-lg leading-none">{property.parking}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Parking</p>
                      </div>
                    )}
                    {property.floors > 0 && (
                      <div className="text-center">
                        <span className="text-blue-400 text-xl block mb-1">🏢</span>
                        <p className="text-white font-bold text-lg leading-none">{property.floors}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Floors</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-6">
                <h2 className="font-display text-xl font-bold text-white mb-4">About This Property</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Features */}
              {property.features?.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-xl font-bold text-white mb-4">Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                        <FiCheck className="text-blue-400 flex-shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-xl font-bold text-white mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map(a => (
                      <span key={a} className="badge badge-info">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Property details table */}
              <div className="glass-card p-6">
                <h2 className="font-display text-xl font-bold text-white mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                  {[
                    { label: 'Property Type', value: property.propertyType },
                    { label: 'Category',      value: property.category },
                    { label: 'Listing Type',  value: property.priceType },
                    { label: 'Year Built',    value: property.yearBuilt || 'N/A' },
                    { label: 'Floors',        value: property.floors || 'N/A' },
                    { label: 'Area',          value: `${property.area?.toLocaleString()} ${property.areaUnit}` },
                    { label: 'Bedrooms',      value: property.bedrooms ?? 'N/A' },
                    { label: 'Bathrooms',     value: property.bathrooms ?? 'N/A' },
                    { label: 'Parking',       value: property.parking ?? 'N/A' },
                    { label: 'City',          value: property.city },
                    { label: 'Country',       value: property.country },
                    { label: 'Listed',        value: formatDate(property.createdAt) },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">{d.label}</p>
                      <p className="text-white font-medium capitalize">{String(d.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — booking + agent */}
            <div className="space-y-4">

              {/* Booking widget */}
              <div className="glass-card p-6 sticky top-24">
                <h3 className="font-display text-xl font-bold text-white mb-4">Schedule a Visit</h3>
                {user ? (
                  <form onSubmit={handleBooking} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Pick a Date</label>
                      <input
                        type="date"
                        value={bookingForm.visitDate}
                        onChange={e => setBookingForm(p => ({ ...p, visitDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field text-sm h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Pick a Time</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {TIME_SLOTS.map(t => (
                          <button key={t} type="button"
                            onClick={() => setBookingForm(p => ({ ...p, visitTime: t }))}
                            className={`text-xs py-1.5 rounded-lg border transition-all ${
                              bookingForm.visitTime === t
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                            }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Message (optional)</label>
                      <textarea
                        value={bookingForm.message}
                        onChange={e => setBookingForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Any specific questions for the agent…"
                        rows={3}
                        className="input-field text-sm resize-none"
                      />
                    </div>
                    <button type="submit" disabled={bookLoading} className="btn-primary w-full justify-center py-3">
                      {bookLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><FiCalendar /> Request a Visit</>}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-400 text-sm mb-4">Sign in to book a visit</p>
                    <Link to="/login" className="btn-primary w-full justify-center">Sign In</Link>
                  </div>
                )}
              </div>

              {/* Agent card */}
              {property.agent && (
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-4">Listed By</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                      {property.agent.avatar
                        ? <img src={property.agent.avatar} alt=""
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.style.display='none' }} />
                        : `${property.agent.firstName?.[0]}${property.agent.lastName?.[0]}`}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{property.agent.firstName} {property.agent.lastName}</p>
                      <p className="text-xs text-blue-400">Real Estate Agent</p>
                      {property.agent.city && <p className="text-xs text-slate-500 mt-0.5">📍 {property.agent.city}</p>}
                    </div>
                  </div>
                  {property.agent.bio && (
                    <p className="text-slate-400 text-xs mb-4 leading-relaxed">{property.agent.bio}</p>
                  )}
                  <div className="space-y-2">
                    {property.agent.phone && (
                      <a href={`tel:${property.agent.phone}`}
                        className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
                        <FiPhone className="text-blue-400 flex-shrink-0" />{property.agent.phone}
                      </a>
                    )}
                    <a href={`mailto:${property.agent.email}`}
                      className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors py-1">
                      <FiMail className="text-blue-400 flex-shrink-0" />{property.agent.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
