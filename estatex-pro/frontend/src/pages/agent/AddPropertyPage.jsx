import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUpload, FiX, FiArrowLeft, FiImage, FiStar } from 'react-icons/fi'
import { propertyAPI } from '../../services/api'
import { PROPERTY_TYPES, PROPERTY_CATEGORIES, getPropertyImage } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const FEATURES_LIST  = ['Swimming Pool','Garden','Balcony','Parking','Garage','Security System','CCTV','Elevator','Gym','Rooftop','Smart Home','Fireplace','Central AC','Solar Panels','Waterfront']
const AMENITIES_LIST = ['24/7 Security','Concierge','Valet Parking','Pool','Gym','Sauna','Tennis Court','Kids Play Area','BBQ Area','High Speed Internet','Cable TV','Doorman']

const EMPTY = {
  title:'', description:'', price:'', priceType:'sale', category:'residential',
  propertyType:'apartment', status:'available', address:'', city:'', state:'',
  country:'USA', zipCode:'', bedrooms:'', bathrooms:'', area:'', areaUnit:'sqft',
  floors:1, yearBuilt:'', parking:0, features:[], amenities:[],
  coordinates:{ lat:'', lng:'' }, isFeatured:false, isTrending:false,
}

export default function AddPropertyPage() {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const isEdit     = Boolean(id)
  const qc         = useQueryClient()

  const [form,            setForm]            = useState(EMPTY)
  const [newFiles,        setNewFiles]        = useState([])
  const [newPreviews,     setNewPreviews]     = useState([])
  const [existingImages,  setExistingImages]  = useState([])
  const [removedImages,   setRemovedImages]   = useState([])
  const [submitting,      setSubmitting]      = useState(false)

  // Load existing property for edit mode
  const { data: existing } = useQuery({
    queryKey: ['property-edit', id],
    queryFn:  () => propertyAPI.getOne(id),
    select:   d => d.data.property,
    enabled:  isEdit,
  })

  useEffect(() => {
    if (existing && isEdit) {
      const { agent, _id, __v, createdAt, updatedAt, views, likes, ...rest } = existing
      setForm({ ...EMPTY, ...rest,
        price:    rest.price    || '',
        bedrooms: rest.bedrooms ?? '',
        bathrooms:rest.bathrooms ?? '',
        area:     rest.area     || '',
        yearBuilt:rest.yearBuilt || '',
        parking:  rest.parking  ?? 0,
        floors:   rest.floors   ?? 1,
        features: rest.features  || [],
        amenities:rest.amenities || [],
        coordinates: rest.coordinates || { lat:'', lng:'' },
      })
      setExistingImages(rest.images || [])
    }
  }, [existing, isEdit])

  // CRITICAL FIX: Memoize the handleChange function with useCallback
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }, []) // Empty dependency array - function never changes

  // Handle coordinates separately
  const handleCoordChange = useCallback((coord, value) => {
    setForm(prev => ({
      ...prev,
      coordinates: { ...prev.coordinates, [coord]: value }
    }))
  }, [])

  // New file selected from disk
  const handleFileAdd = useCallback((e) => {
    const files = Array.from(e.target.files)
    setNewFiles(prev => [...prev, ...files])
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }, [])

  // Remove a new (not yet uploaded) file
  const removeNewFile = useCallback((index) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewFiles(prev => prev.filter((_, idx) => idx !== index))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== index))
  }, [newPreviews])

  // Toggle removal of an existing Cloudinary image
  const toggleRemoveExisting = useCallback((url) => {
    setRemovedImages(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }, [])

  // Set a different thumbnail
  const setAsThumbnail = useCallback((url) => {
    setExistingImages(prev => [url, ...prev.filter(u => u !== url)])
    toast.success('Thumbnail updated')
  }, [])

  // Toggle features and amenities
  const toggleFeature = useCallback((feature) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }, [])

  const toggleAmenity = useCallback((amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.address || !form.city || !form.country || !form.area) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()

      // Scalar fields
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          fd.append(k, JSON.stringify(v))
        } else if (typeof v === 'object' && v !== null) {
          fd.append(k, JSON.stringify(v))
        } else {
          fd.append(k, String(v))
        }
      })

      // New images
      newFiles.forEach(f => fd.append('images', f))

      // Images to remove
      if (removedImages.length > 0) {
        fd.append('removeImages', JSON.stringify(removedImages))
      }

      if (isEdit) {
        await propertyAPI.update(id, fd)
        toast.success('Property updated!')
      } else {
        await propertyAPI.create(fd)
        toast.success('Property created!')
      }

      qc.invalidateQueries(['my-listings'])
      qc.invalidateQueries(['property-edit', id])
      navigate('/dashboard/agent/listings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save property')
    } finally {
      setSubmitting(false)
    }
  }

  // Memoize Section component to prevent re-renders
  const Section = useCallback(({ title, children }) => (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">{title}</h3>
      {children}
    </div>
  ), [])

  // Memoize Field component
  const Field = useCallback(({ label, required, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  ), [])

  const totalImages = useMemo(() => 
    (existingImages.filter(u => !removedImages.includes(u))).length + newFiles.length,
    [existingImages, removedImages, newFiles]
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {isEdit ? 'Update your property details and images' : 'Create a new listing — images upload directly to Cloudinary'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Property Title <span className="text-red-400 ml-1">*</span>
            </label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Modern Luxury Villa with Ocean View" 
              className="input-field" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={4} 
              required 
              placeholder="Describe the property in detail..." 
              className="input-field resize-none" 
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Property Type <span className="text-red-400 ml-1">*</span>
              </label>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input-field">
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {PROPERTY_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Listing Type</label>
              <select name="priceType" value={form.priceType} onChange={handleChange} className="input-field">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="off_market">Off Market</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Size */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">Pricing & Size</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Price (USD) <span className="text-red-400 ml-1">*</span>
              </label>
              <input 
                type="number" 
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                required 
                min="0" 
                placeholder="500000" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Area <span className="text-red-400 ml-1">*</span>
              </label>
              <input 
                type="number" 
                name="area" 
                value={form.area} 
                onChange={handleChange} 
                required 
                min="0" 
                placeholder="2500" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit</label>
              <select name="areaUnit" value={form.areaUnit} onChange={handleChange} className="input-field">
                <option value="sqft">sqft</option>
                <option value="sqm">sqm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Year Built</label>
              <input 
                type="number" 
                name="yearBuilt" 
                value={form.yearBuilt} 
                onChange={handleChange} 
                min="1900" 
                max={new Date().getFullYear()} 
                placeholder="2020" 
                className="input-field" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bedrooms</label>
              <input 
                type="number" 
                name="bedrooms" 
                value={form.bedrooms} 
                onChange={handleChange} 
                min="0" 
                placeholder="3" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bathrooms</label>
              <input 
                type="number" 
                name="bathrooms" 
                value={form.bathrooms} 
                onChange={handleChange} 
                min="0" 
                placeholder="2" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Floors</label>
              <input 
                type="number" 
                name="floors" 
                value={form.floors} 
                onChange={handleChange} 
                min="1" 
                placeholder="1" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Parking</label>
              <input 
                type="number" 
                name="parking" 
                value={form.parking} 
                onChange={handleChange} 
                min="0" 
                placeholder="2" 
                className="input-field" 
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">Location</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Address <span className="text-red-400 ml-1">*</span>
            </label>
            <input 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              required 
              placeholder="123 Ocean Drive" 
              className="input-field" 
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                City <span className="text-red-400 ml-1">*</span>
              </label>
              <input 
                name="city" 
                value={form.city} 
                onChange={handleChange} 
                required 
                placeholder="Miami" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">State</label>
              <input 
                name="state" 
                value={form.state} 
                onChange={handleChange} 
                placeholder="FL" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Country <span className="text-red-400 ml-1">*</span>
              </label>
              <input 
                name="country" 
                value={form.country} 
                onChange={handleChange} 
                required 
                placeholder="USA" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ZIP Code</label>
              <input 
                name="zipCode" 
                value={form.zipCode} 
                onChange={handleChange} 
                placeholder="33139" 
                className="input-field" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Latitude</label>
              <input 
                type="number" 
                step="any" 
                value={form.coordinates.lat} 
                onChange={(e) => handleCoordChange('lat', e.target.value)} 
                placeholder="25.7617" 
                className="input-field" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Longitude</label>
              <input 
                type="number" 
                step="any" 
                value={form.coordinates.lng} 
                onChange={(e) => handleCoordChange('lng', e.target.value)} 
                placeholder="-80.1918" 
                className="input-field" 
              />
            </div>
          </div>
        </div>

        {/* Features & Amenities */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">Features & Amenities</h3>
          
          <div>
            <p className="text-sm text-slate-400 mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {FEATURES_LIST.map(f => (
                <button 
                  key={f} 
                  type="button" 
                  onClick={() => toggleFeature(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    form.features.includes(f) 
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(a => (
                <button 
                  key={a} 
                  type="button" 
                  onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    form.amenities.includes(a) 
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">
            Property Images ({totalImages} total)
          </h3>
          
          {/* Existing images */}
          {isEdit && existingImages.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">
                Current Images — click ✕ to remove, ⭐ to set as thumbnail
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {existingImages.map((url, i) => {
                  const isRemoved = removedImages.includes(url)
                  const isThumbnail = i === 0 && !isRemoved
                  return (
                    <div 
                      key={url} 
                      className={`relative rounded-xl overflow-hidden aspect-square group border-2 transition-all ${
                        isRemoved 
                          ? 'border-red-500/60 opacity-40 grayscale' 
                          : isThumbnail 
                            ? 'border-blue-500' 
                            : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={e => { 
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&auto=format' 
                        }} 
                      />

                      {isThumbnail && !isRemoved && (
                        <div className="absolute top-1 left-1 bg-blue-600 rounded-md px-1 py-0.5 text-white text-xs font-bold">
                          Cover
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {!isThumbnail && !isRemoved && (
                          <button 
                            type="button" 
                            onClick={() => setAsThumbnail(url)}
                            className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-700"
                            title="Set as thumbnail"
                          >
                            <FiStar />
                          </button>
                        )}
                        <button 
                          type="button" 
                          onClick={() => toggleRemoveExisting(url)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs ${
                            isRemoved 
                              ? 'bg-slate-600 hover:bg-slate-500' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          title={isRemoved ? 'Undo remove' : 'Remove image'}
                        >
                          <FiX />
                        </button>
                      </div>

                      {isRemoved && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-red-400 font-bold text-xs bg-black/70 px-2 py-1 rounded">
                            Will be deleted
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {removedImages.length > 0 && (
                <p className="text-orange-400 text-xs mt-2">
                  ⚠️ {removedImages.length} image(s) will be permanently deleted from Cloudinary on save.
                </p>
              )}
            </div>
          )}

          {/* Upload new images */}
          <div>
            {isEdit && <p className="text-xs text-slate-400 mb-2 font-medium">Add New Images</p>}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer group">
              <FiUpload className="text-3xl text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
              <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                Click to upload — images go straight to Cloudinary
              </p>
              <p className="text-slate-600 text-xs mt-1">
                JPG, PNG, WEBP up to 10 MB each · max 10 files
              </p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileAdd} 
                className="hidden" 
              />
            </label>

            {/* New file previews */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                {newPreviews.map((src, i) => (
                  <div 
                    key={i} 
                    className="relative rounded-xl overflow-hidden aspect-square group border-2 border-emerald-500/40"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-emerald-600 rounded-md px-1 py-0.5 text-white text-xs font-bold">
                      New
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flags */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white text-lg border-b border-white/5 pb-3">Listing Flags</h3>
          
          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="isFeatured" 
                checked={form.isFeatured} 
                onChange={handleChange} 
                className="w-4 h-4 accent-blue-600" 
              />
              <span className="text-slate-300 text-sm">⭐ Mark as Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="isTrending" 
                checked={form.isTrending} 
                onChange={handleChange} 
                className="w-4 h-4 accent-blue-600" 
              />
              <span className="text-slate-300 text-sm">🔥 Mark as Trending</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn-ghost flex-1 justify-center py-3"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary flex-1 justify-center py-3"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              isEdit ? 'Save Changes' : 'Create Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}