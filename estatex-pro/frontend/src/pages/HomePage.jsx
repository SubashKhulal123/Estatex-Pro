import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiMapPin, FiArrowRight, FiStar, FiShield, FiTrendingUp, FiHome, FiUsers, FiAward } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { propertyAPI } from '../services/api'
import PropertyCard from '../components/properties/PropertyCard'
import Navbar from '../components/layout/Navbar'

const HERO_STATS = [
  { label: 'Properties Listed', value: '12,400+', icon: FiHome },
  { label: 'Happy Clients', value: '8,200+', icon: FiUsers },
  { label: 'Cities Covered', value: '120+', icon: FiMapPin },
  { label: 'Awards Won', value: '48', icon: FiAward },
]

const CITIES = ['Miami', 'New York', 'Los Angeles', 'Chicago', 'Seattle', 'Denver', 'Houston', 'Boston']

const FEATURES = [
  {
    icon: FiSearch,
    title: 'Smart Search',
    desc: 'Advanced AI-powered search filters to find your perfect property in seconds.',
    color: 'from-blue-600 to-blue-800'
  },
  {
    icon: FiShield,
    title: 'Verified Listings',
    desc: 'Every property is verified by our expert team for authenticity and accuracy.',
    color: 'from-orange-500 to-orange-700'
  },
  {
    icon: FiTrendingUp,
    title: 'Market Insights',
    desc: 'Real-time analytics and market trends to make informed investment decisions.',
    color: 'from-emerald-500 to-emerald-700'
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [propertyType, setPropertyType] = useState('')

  const { data: featuredData } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertyAPI.getAll({ isFeatured: true, limit: 6 }),
    select: d => d.data.properties
  })

  const { data: trendingData } = useQuery({
    queryKey: ['trending-properties'],
    queryFn: () => propertyAPI.getAll({ isTrending: true, limit: 3 }),
    select: d => d.data.properties
  })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCity) params.set('city', selectedCity)
    if (propertyType) params.set('propertyType', propertyType)
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* ====== HERO ====== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950" />
          {/* Animated blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-4xl">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              #1 Premium Real Estate Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              Find Your{' '}
              <span className="gradient-text">Perfect</span>
              <br />
              Dream Property
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-xl mb-10 max-w-2xl leading-relaxed"
            >
              Discover thousands of premium properties across the country. From luxury villas to cozy apartments — your next home is just a search away.
            </motion.p>

            {/* Search box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="glass-card p-2 max-w-3xl"
            >
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                  <FiSearch className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by address, city, or keyword..."
                    className="bg-transparent text-white text-sm w-full outline-none placeholder:text-slate-500"
                  />
                </div>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 text-slate-300 text-sm outline-none border border-white/5"
                >
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 text-slate-300 text-sm outline-none border border-white/5"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="office">Office</option>
                </select>
                <button type="submit" className="btn-primary whitespace-nowrap">
                  <FiSearch /> Search
                </button>
              </form>
            </motion.div>

            {/* Quick filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {['For Sale', 'For Rent', 'Luxury', 'New Build', 'Commercial'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/properties?search=${tag}`)}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-t-2xl overflow-hidden">
              {HERO_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-slate-900/80 backdrop-blur px-6 py-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    <stat.icon className="text-blue-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                    <p className="text-slate-500 text-xs">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURED ====== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-400 text-sm font-medium mb-2">✦ Hand-picked</p>
            <h2 className="font-display text-4xl font-bold text-white">Featured Properties</h2>
          </div>
          <button
            onClick={() => navigate('/properties?isFeatured=true')}
            className="btn-ghost text-sm hidden sm:flex"
          >
            View All <FiArrowRight />
          </button>
        </div>

        {featuredData?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.map((p, i) => (
              <PropertyCard key={p._id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="skeleton h-52" />
                <div className="bg-slate-800/50 p-4 space-y-2">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-20 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-400 text-sm font-medium mb-2">✦ Simple Process</p>
            <h2 className="font-display text-4xl font-bold text-white">How EstateX Pro Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search & Filter', desc: 'Browse thousands of verified listings using our advanced search and filter system.', icon: '🔍' },
              { step: '02', title: 'Book a Visit', desc: 'Schedule property visits directly with agents through our seamless booking system.', icon: '📅' },
              { step: '03', title: 'Move In', desc: 'Complete the process with our expert agents and make your dream home a reality.', icon: '🏠' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative glass-card p-8 text-center group hover:border-blue-500/30 transition-colors"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-xs font-bold text-white">
                  {step.step}
                </div>
                <div className="text-5xl mb-4 mt-4">{step.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-400 text-sm font-medium mb-3">✦ Why Choose Us</p>
            <h2 className="font-display text-4xl font-bold text-white mb-6">
              The Smarter Way<br />to Find Real Estate
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              EstateX Pro combines cutting-edge technology with deep real estate expertise to deliver an unparalleled property search experience.
            </p>
            <div className="space-y-4">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/3 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center flex-shrink-0`}>
                    <feat.icon className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feat.title}</h3>
                    <p className="text-slate-400 text-sm">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <button onClick={() => navigate('/properties')} className="btn-primary mt-8">
              Explore Properties <FiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop',
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-2xl overflow-hidden ${i === 1 ? 'mt-8' : ''} ${i === 3 ? '-mt-8' : ''}`}
                style={{ height: '200px' }}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative glass-card p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-orange-500/10" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of satisfied customers who found their perfect property with EstateX Pro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/register')} className="btn-primary text-base py-3 px-8">
                  Get Started Free <FiArrowRight />
                </button>
                <button onClick={() => navigate('/properties')} className="btn-ghost text-base py-3 px-8">
                  Browse Properties
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <FiHome className="text-white text-sm" />
            </div>
            <span className="font-display font-bold">EstateX Pro</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 EstateX Pro. All rights reserved.</p>
          <div className="flex gap-6 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
