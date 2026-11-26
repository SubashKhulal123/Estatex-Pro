import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiMapPin, FiHome } from 'react-icons/fi'
import { propertyAPI } from '../../services/api'
import { formatPrice, getPropertyImage } from '../../utils/helpers'
import { useDebounce } from '../../hooks/useDebounce'

export default function GlobalSearch({ onClose }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef  = useRef(null)
  const navigate  = useNavigate()
  const debounced = useDebounce(query, 300)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!debounced.trim() || debounced.length < 2) { setResults([]); return }
    setLoading(true)
    propertyAPI.getAll({ search: debounced, limit: 6 })
      .then(r => setResults(r.data.properties || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debounced])

  const go = (url) => { navigate(url); onClose?.() }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 glass-card border-blue-500/30">
        {loading
          ? <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />
          : <FiSearch className="text-blue-400 text-xl flex-shrink-0" />}
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search properties by title, city, address…"
          className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-slate-500"
          onKeyDown={e => {
            if (e.key === 'Enter' && query.trim()) go(`/properties?search=${encodeURIComponent(query)}`)
            if (e.key === 'Escape') onClose?.()
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white transition-colors">
            <FiX />
          </button>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-2 glass-card overflow-hidden"
          >
            {results.map((p, i) => (
              <button
                key={p._id}
                onClick={() => go(`/properties/${p._id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
              >
                <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                  <img
                    src={getPropertyImage(p, i)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=100&auto=format' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.title}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                    <FiMapPin className="text-orange-400 flex-shrink-0" />
                    {p.address}, {p.city}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-blue-400 font-semibold text-sm">{formatPrice(p.price, p.priceType)}</p>
                  <p className="text-slate-500 text-xs capitalize">{p.propertyType}</p>
                </div>
              </button>
            ))}

            {/* View all */}
            <button
              onClick={() => go(`/properties?search=${encodeURIComponent(query)}`)}
              className="w-full px-4 py-3 text-blue-400 text-sm hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <FiSearch /> View all results for "{query}"
            </button>
          </motion.div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 glass-card px-4 py-6 text-center"
          >
            <FiHome className="text-3xl text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No properties found for "{query}"</p>
            <p className="text-slate-600 text-xs mt-1">Try a different keyword or city name</p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-slate-600 text-xs text-center mt-3">
        Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-slate-500">Enter</kbd> to search all · <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-slate-500">Esc</kbd> to close
      </p>
    </div>
  )
}
