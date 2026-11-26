import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiFilter, FiGrid, FiList, FiX, FiSliders, FiChevronDown } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { propertyAPI } from '../../services/api'
import PropertyCard from '../../components/properties/PropertyCard'
import Navbar from '../../components/layout/Navbar'
import { PROPERTY_TYPES, PROPERTY_CATEGORIES } from '../../utils/helpers'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-views', label: 'Most Viewed' },
]

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    priceType: searchParams.get('priceType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isTrending: searchParams.get('isTrending') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: 1,
  })

  const queryParams = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyAPI.getAll(queryParams),
    select: d => d.data,
    keepPreviousData: true,
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== 1))
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({ search: '', city: '', propertyType: '', category: '', status: '', priceType: '', minPrice: '', maxPrice: '', bedrooms: '', isFeatured: '', isTrending: '', sort: '-createdAt', page: 1 })
    setSearchParams({})
  }

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== '' && !['sort', 'page'].includes(k)).length

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 lg:pt-24">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/5 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Browse Properties</h1>
            <p className="text-slate-400 text-sm mb-6">
              {data?.total ? `${data.total} properties found` : 'Searching...'}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-64 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  placeholder="Search properties..."
                  className="input-field pl-11 h-11"
                />
              </div>
              <input
                value={filters.city}
                onChange={e => handleFilterChange('city', e.target.value)}
                placeholder="City"
                className="input-field w-36 h-11"
              />
              <select
                value={filters.sort}
                onChange={e => handleFilterChange('sort', e.target.value)}
                className="input-field w-48 h-11"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`btn-ghost h-11 px-4 relative ${filterOpen ? 'border-blue-500/50 text-blue-400' : ''}`}
              >
                <FiSliders /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button type="submit" className="btn-primary h-11 px-6">Search</button>
              <div className="flex gap-1 ml-auto">
                <button type="button" onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl border transition-colors ${viewMode === 'grid' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/10 text-slate-400'}`}>
                  <FiGrid />
                </button>
                <button type="button" onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl border transition-colors ${viewMode === 'list' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/10 text-slate-400'}`}>
                  <FiList />
                </button>
              </div>
            </form>

            {/* Advanced filters */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-white/5">
                    <select value={filters.propertyType} onChange={e => handleFilterChange('propertyType', e.target.value)} className="input-field h-10 text-sm">
                      <option value="">All Types</option>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                    <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} className="input-field h-10 text-sm">
                      <option value="">All Categories</option>
                      {PROPERTY_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <select value={filters.priceType} onChange={e => handleFilterChange('priceType', e.target.value)} className="input-field h-10 text-sm">
                      <option value="">Sale & Rent</option>
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="lease">For Lease</option>
                    </select>
                    <select value={filters.bedrooms} onChange={e => handleFilterChange('bedrooms', e.target.value)} className="input-field h-10 text-sm">
                      <option value="">Any Beds</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ Beds</option>)}
                    </select>
                    <input value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} placeholder="Min Price" type="number" className="input-field h-10 text-sm" />
                    <input value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} placeholder="Max Price" type="number" className="input-field h-10 text-sm" />
                  </div>
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {[
                      { key: 'isFeatured', val: 'true', label: '⭐ Featured' },
                      { key: 'isTrending', val: 'true', label: '🔥 Trending' },
                      { key: 'status', val: 'available', label: '✅ Available' },
                    ].map(q => (
                      <button
                        key={q.key}
                        type="button"
                        onClick={() => handleFilterChange(q.key, filters[q.key] === q.val ? '' : q.val)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filters[q.key] === q.val ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'border-white/10 text-slate-400 hover:border-white/30'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                    {activeFilterCount > 0 && (
                      <button type="button" onClick={clearFilters} className="text-xs px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1">
                        <FiX /> Clear All
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton h-52" />
                  <div className="bg-slate-800/40 p-4 space-y-2">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.properties?.length > 0 ? (
            <>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl'}`}>
                {data.properties.map((p, i) => (
                  <PropertyCard key={p._id} property={p} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {[...Array(data.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleFilterChange('page', i + 1)}
                      className={`w-9 h-9 rounded-xl font-medium text-sm transition-all ${
                        filters.page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">No properties found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
