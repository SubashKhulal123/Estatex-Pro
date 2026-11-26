import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { HiOutlineHome } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      const dashMap = {
        super_admin: '/dashboard/admin',
        admin: '/dashboard/admin',
        agent: '/dashboard/agent',
        property_manager: '/dashboard/agent',
        customer: '/dashboard/customer',
      }
      navigate(dashMap[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email) => {
    setForm({ email, password: 'Admin@123' })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-blue-900/40" />
        <div className="relative z-10 flex flex-col justify-between p-12 max-w-lg">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
              <HiOutlineHome className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              EstateX <span className="text-orange-500">Pro</span>
            </span>
          </Link>
          <div>
            <h2 className="font-display text-5xl font-bold text-white mb-6 leading-tight">
              Find Your<br />Dream <span className="gradient-text">Property</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Join thousands of people who found their perfect home through EstateX Pro's premium real estate platform.
            </p>
            <div className="mt-8 flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-br ${['from-blue-400 to-blue-600','from-orange-400 to-orange-600','from-emerald-400 to-emerald-600','from-purple-400 to-purple-600'][i]}`} />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                +8k
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-3">Trusted by 8,000+ happy customers</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <HiOutlineHome className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">EstateX Pro</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-8">Sign in to your account to continue</p>

          {/* Demo accounts */}
          <div className="glass-card p-4 mb-6">
            <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Super Admin', email: 'superadmin@estatex.com' },
                { label: 'Admin', email: 'admin@estatex.com' },
                { label: 'Agent', email: 'agent@estatex.com' },
                { label: 'Customer', email: 'customer@estatex.com' },
              ].map(d => (
                <button
                  key={d.email}
                  onClick={() => fillDemo(d.email)}
                  className="text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 transition-colors border border-white/5"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <FiArrowRight /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
