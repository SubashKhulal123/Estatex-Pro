import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiStar } from 'react-icons/fi'
import { propertyAPI } from '../../services/api'
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=120&auto=format&fit=crop'

export default function AdminProperties() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', search, status, type, page],
    queryFn: () => propertyAPI.getAll({ search, status: status || undefined, propertyType: type || undefined, page, limit: 15, sort: '-createdAt' }),
    select: d => d.data,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => propertyAPI.delete(id),
    onSuccess: () => { toast.success('Property deleted'); qc.invalidateQueries(['admin-properties']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed')
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Properties</h1>
          <p className="text-slate-400 mt-1">{data?.total || 0} total listings</p>
        </div>
        <Link to="/dashboard/agent/add-property" className="btn-primary">
          <FiPlus /> Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search properties..." className="input-field pl-10 h-10 text-sm" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field w-36 h-10 text-sm">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
          <option value="pending">Pending</option>
        </select>
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }} className="input-field w-36 h-10 text-sm">
          <option value="">All Types</option>
          {['apartment','house','villa','studio','penthouse','office','warehouse'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>City</th>
                <th>Views</th>
                <th>Listed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : data?.properties?.map(p => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                        <img src={p.thumbnail?.startsWith('http') ? p.thumbnail : FALLBACK_IMG} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG }} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium line-clamp-1 max-w-48">{p.title}</p>
                        <p className="text-slate-500 text-xs">{p.address}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-slate-300 text-sm capitalize">{p.propertyType}</span></td>
                  <td><span className="text-blue-400 font-semibold text-sm">{formatPrice(p.price, p.priceType)}</span></td>
                  <td><span className={`badge text-xs ${getStatusColor(p.status)}`}>{p.status}</span></td>
                  <td className="text-slate-400 text-sm">{p.city}</td>
                  <td className="text-slate-400 text-sm">{p.views || 0}</td>
                  <td className="text-slate-400 text-sm">{formatDate(p.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
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
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.total > 15 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-slate-500 text-sm">Showing {Math.min((page-1)*15+1,data.total)}–{Math.min(page*15,data.total)} of {data.total}</p>
            <div className="flex gap-1">
              {[...Array(Math.ceil(data.total/15))].slice(0,6).map((_,i)=>(
                <button key={i} onClick={()=>setPage(i+1)} className={`w-8 h-8 rounded-lg text-sm ${page===i+1?'bg-blue-600 text-white':'text-slate-400 hover:bg-white/5'}`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
