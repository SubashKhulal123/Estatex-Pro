const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const notificationSchema = new mongoose.Schema({
  message:   { type: String, required: true },
  type:      { type: String, enum: ['info','success','warning','error'], default: 'info' },
  isRead:    { type: Boolean, default: false },
  createdAt: { type: Date,    default: Date.now },
})

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role: {
    type: String,
    enum: ['super_admin','admin','agent','property_manager','customer'],
    default: 'customer',
  },
  // Cloudinary secure URL stored directly
  avatar:  { type: String, default: '' },
  phone:   { type: String, default: '' },
  bio:     { type: String, default: '' },
  address: { type: String, default: '' },
  city:    { type: String, default: '' },
  country: { type: String, default: '' },
  isActive:        { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  // Populated when GET /api/auth/me is called
  savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  lastLogin:       { type: Date },
  notifications:   [notificationSchema],
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Virtual fullName
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})
userSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('User', userSchema)
