import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiSave, FiLock, FiCamera, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ProfileSettings() {
  const { user, updateUser } = useAuth()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passLoading,    setPassLoading]    = useState(false)
  const [avatarPreview,  setAvatarPreview]  = useState(null)
  const [avatarFile,     setAvatarFile]     = useState(null)

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    bio:       user?.bio       || '',
    address:   user?.address   || '',
    city:      user?.city      || '',
    country:   user?.country   || '',
  })
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Avatar must be under 5 MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (avatarFile) fd.append('avatar', avatarFile)

      const { data } = await authAPI.updateProfile(fd)
      updateUser(data.user)
      // If a new avatar was uploaded, clear the local preview (server URL is now in user.avatar)
      if (avatarFile) { setAvatarPreview(null); setAvatarFile(null) }
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setPassLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword:     passForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPassLoading(false)
    }
  }

  // Resolve avatar src: prefer local preview → Cloudinary URL → initials placeholder
  const avatarSrc = avatarPreview || user?.avatar || null
  const initials  = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account details and avatar</p>
      </div>

      {/* Avatar card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {avatarSrc
                ? <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                : initials}
            </div>
            <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
              <FiCamera className="text-white text-xs" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <p className="text-blue-400 text-xs mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
            {avatarFile && (
              <p className="text-emerald-400 text-xs mt-1">
                ✓ New avatar selected — will upload to Cloudinary on save
              </p>
            )}
            {!avatarFile && user?.avatar && (
              <p className="text-slate-500 text-xs mt-1 truncate max-w-xs">
                Hosted on Cloudinary
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal info form */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <FiUser className="text-blue-400" /> Personal Information
        </h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">First Name</label>
              <input
                value={form.firstName}
                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                required className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Last Name</label>
              <input
                value={form.lastName}
                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                required className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={user?.email}
                disabled
                className="input-field pl-11 opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-slate-600 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+1-555-0100"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              placeholder="Tell us about yourself…"
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="123 Main Street"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">City</label>
              <input
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                placeholder="Miami"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Country</label>
              <input
                value={form.country}
                onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                placeholder="USA"
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><FiSave /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <FiLock className="text-blue-400" /> Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Current Password</label>
            <input
              type="password"
              value={passForm.currentPassword}
              onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
              required
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">New Password</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
              required
              placeholder="Min. 6 characters"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Confirm New Password</label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
              required
              placeholder="Repeat new password"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={passLoading} className="btn-primary">
            {passLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><FiLock /> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  )
}
