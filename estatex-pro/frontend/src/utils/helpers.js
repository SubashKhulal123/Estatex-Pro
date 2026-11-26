// ─── Price formatting ─────────────────────────────────────────────────────────
export const formatPrice = (price, priceType = 'sale') => {
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  if (priceType === 'rent')  return `${f}/mo`
  if (priceType === 'lease') return `${f}/yr`
  return f
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// ─── Image URL resolver ───────────────────────────────────────────────────────
// Cloudinary URLs are full https:// already.
// Local /uploads/... paths are legacy — map to a placeholder.
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80'

export const resolveImageUrl = (url) => {
  if (!url) return PLACEHOLDER
  if (url.startsWith('http')) return url          // Cloudinary or any external URL
  if (url.startsWith('/uploads')) return url       // proxied through Vite dev server
  return PLACEHOLDER
}

// Keep legacy name for backward compat
export const getImageUrl = resolveImageUrl

// ─── Badge helpers ────────────────────────────────────────────────────────────
export const getStatusColor = (status) => ({
  available: 'badge-success', sold: 'badge-error',
  rented: 'badge-warning',    pending: 'badge-warning',
  off_market: 'badge-info',   approved: 'badge-success',
  rejected: 'badge-error',    completed: 'badge-purple',
  cancelled: 'badge-error',   active: 'badge-success',
  inactive: 'badge-error',
}[status] || 'badge-info')

export const getRoleColor = (role) => ({
  super_admin: 'badge-error', admin: 'badge-warning',
  agent: 'badge-info', property_manager: 'badge-purple', customer: 'badge-success',
}[role] || 'badge-info')

export const getRoleLabel = (role) => ({
  super_admin: 'Super Admin', admin: 'Admin',
  agent: 'Agent', property_manager: 'Property Manager', customer: 'Customer',
}[role] || role)

// ─── Fallback image pool (for seeded data that has no Cloudinary URL) ─────────
export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
]

export const getPropertyImage = (property, idx = 0) => {
  const imgs = [property?.thumbnail, ...(property?.images || [])].filter(Boolean)
  for (const img of imgs) {
    if (img.startsWith('http')) return img
  }
  return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const PROPERTY_TYPES      = ['apartment','house','villa','studio','penthouse','townhouse','office','shop','warehouse','land']
export const PROPERTY_CATEGORIES = ['residential','commercial','industrial','land','luxury']
export const PROPERTY_STATUSES   = ['available','sold','rented','pending','off_market']
export const PRICE_TYPES         = ['sale','rent','lease']
