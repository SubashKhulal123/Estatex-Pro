const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  priceType: { type: String, enum: ['sale', 'rent', 'lease'], default: 'sale' },
  category: { type: String, enum: ['residential', 'commercial', 'industrial', 'land', 'luxury'], default: 'residential' },
  propertyType: { type: String, enum: ['apartment', 'house', 'villa', 'studio', 'penthouse', 'townhouse', 'office', 'shop', 'warehouse', 'land'], required: true },
  status: { type: String, enum: ['available', 'sold', 'rented', 'pending', 'off_market'], default: 'available' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  zipCode: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  area: { type: Number, required: true },
  areaUnit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' },
  floors: { type: Number, default: 1 },
  yearBuilt: { type: Number },
  parking: { type: Number, default: 0 },
  features: [{ type: String }],
  amenities: [{ type: String }],
  images: [{ type: String }],
  thumbnail: { type: String },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  virtualTourUrl: { type: String },
  videoUrl: { type: String },
}, { timestamps: true });

propertySchema.index({ city: 1, status: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text', address: 'text' });

module.exports = mongoose.model('Property', propertySchema);
