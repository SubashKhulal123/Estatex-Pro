import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi'
import { userAPI } from '../../services/api'
import { formatDate, getRoleColor, getRoleLabel, getStatusColor } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ROLES = ['super_admin', 'admin', 'agent', 'property_manager', 'customer']

export default function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'customer', phone: '', city: '', country: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => userAPI.getAll({ search, role: roleFilter, page, limit: 15 }),
    select: d => d.data,
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => userAPI.toggleStatus(id),
    onSuccess: (d) => { toast.success(d.data.message); qc.invalidateQueries(['admin-users']) },
    onError: () => toast.error('Failed to update status')
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => userAPI.delete(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['admin-users']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed')
  })

  const saveMutation = useMutation({
    mutationFn: (data) => editUser ? userAPI.update(editUser._id, data) : userAPI.create(data),
    onSuccess: () => {
      toast.success(editUser ? 'User updated!' : 'User created!')
      qc.invalidateQueries(['admin-users'])
      setShowModal(false)
      setEditUser(null)
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'customer', phone: '', city: '', country: '' })
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed')
  })

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role, phone: user.phone || '', city: user.city || '', country: user.country || '' })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.password) delete payload.password
    saveMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">{data?.total || 0} total users</p>
        </div>
        <button onClick={() => { setEditUser(null); setShowModal(true) }} className="btn-primary">
          <FiPlus /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search users..." className="input-field pl-10 h-10 text-sm" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="input-field w-40 h-10 text-sm">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>City</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.users?.map(user => (
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge text-xs ${getRoleColor(user.role)}`}>{getRoleLabel(user.role)}</span></td>
                  <td>
                    <span className={`badge text-xs ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-slate-400 text-sm">{user.city || '—'}</td>
                  <td className="text-slate-400 text-sm">{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                        <FiEdit2 className="text-sm" />
                      </button>
                      <button onClick={() => toggleMutation.mutate(user._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-400/10 transition-colors">
                        {user.isActive ? <FiToggleRight className="text-sm" /> : <FiToggleLeft className="text-sm" />}
                      </button>
                      <button onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(user._id) }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.total > 15 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-slate-500 text-sm">Showing {Math.min((page - 1) * 15 + 1, data.total)}–{Math.min(page * 15, data.total)} of {data.total}</p>
            <div className="flex gap-1">
              {[...Array(Math.ceil(data.total / 15))].slice(0, 6).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">{editUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => { setShowModal(false); setEditUser(null) }} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">First Name</label>
                  <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required placeholder="John" className="input-field text-sm h-10" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Last Name</label>
                  <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required placeholder="Doe" className="input-field text-sm h-10" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="input-field text-sm h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field text-sm h-10">
                    {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1-555-0100" className="input-field text-sm h-10" />
                </div>
              </div>
              {!editUser && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editUser} placeholder="Min 6 characters" className="input-field text-sm h-10" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">City</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="input-field text-sm h-10" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Country</label>
                  <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="input-field text-sm h-10" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditUser(null) }} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 justify-center">
                  {saveMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
