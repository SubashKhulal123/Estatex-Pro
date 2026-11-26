const Property = require('../models/Property');
const User     = require('../models/User');
const { deleteCloudinaryImages, deleteCloudinaryImage } = require('../middleware/upload');

// @desc   Get all properties (with filters / pagination)
// @route  GET /api/properties
const getProperties = async (req, res) => {
  try {
    const {
      search, city, country, propertyType, category, status, priceType,
      minPrice, maxPrice, bedrooms, bathrooms, isFeatured, isTrending,
      sort = '-createdAt', page = 1, limit = 12,
    } = req.query;

    const query = {};
    if (search)      query.$text  = { $search: search };
    if (city)        query.city   = new RegExp(city, 'i');
    if (country)     query.country= new RegExp(country, 'i');
    if (propertyType)query.propertyType = propertyType;
    if (category)    query.category     = category;
    if (status)      query.status       = status;
    else             query.status       = { $ne: 'off_market' };
    if (priceType)   query.priceType    = priceType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bedrooms)          query.bedrooms  = { $gte: Number(bedrooms) };
    if (bathrooms)         query.bathrooms = { $gte: Number(bathrooms) };
    if (isFeatured === 'true') query.isFeatured = true;
    if (isTrending === 'true') query.isTrending = true;

    const total      = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('agent', 'firstName lastName email avatar phone')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, count: properties.length, total, pages: Math.ceil(total / limit), currentPage: Number(page), properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single property
// @route  GET /api/properties/:id
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'firstName lastName email avatar phone bio city');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create property
// @route  POST /api/properties
const createProperty = async (req, res) => {
  try {
    const data = { ...req.body, agent: req.user.id };

    // Cloudinary gives us req.files with .path = full https:// URL
    if (req.files && req.files.length > 0) {
      data.images    = req.files.map(f => f.path);   // f.path IS the Cloudinary URL
      data.thumbnail = data.images[0];
    }

    // Parse JSON arrays (sent as strings from FormData)
    if (typeof data.features  === 'string') { try { data.features  = JSON.parse(data.features);  } catch { data.features  = []; } }
    if (typeof data.amenities === 'string') { try { data.amenities = JSON.parse(data.amenities); } catch { data.amenities = []; } }
    if (typeof data.coordinates === 'string') { try { data.coordinates = JSON.parse(data.coordinates); } catch { data.coordinates = {}; } }

    const property = await Property.create(data);
    await property.populate('agent', 'firstName lastName email avatar');
    res.status(201).json({ success: true, message: 'Property created!', property });
  } catch (err) {
    // If DB save fails, clean up uploaded images
    if (req.files?.length) await deleteCloudinaryImages(req.files.map(f => f.path));
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update property
// @route  PUT /api/properties/:id
const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    if (property.agent.toString() !== req.user.id && !['admin','super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const update = { ...req.body };
    if (typeof update.features    === 'string') { try { update.features    = JSON.parse(update.features);    } catch { update.features    = []; } }
    if (typeof update.amenities   === 'string') { try { update.amenities   = JSON.parse(update.amenities);   } catch { update.amenities   = []; } }
    if (typeof update.coordinates === 'string') { try { update.coordinates = JSON.parse(update.coordinates); } catch { update.coordinates = {}; } }

    // Handle images:
    // - removeImages: comma-separated URLs to delete from Cloudinary + DB
    // - new req.files: append to existing
    let currentImages = [...(property.images || [])];

    if (update.removeImages) {
      const toRemove = Array.isArray(update.removeImages)
        ? update.removeImages
        : update.removeImages.split(',').map(s => s.trim());
      await deleteCloudinaryImages(toRemove);
      currentImages = currentImages.filter(img => !toRemove.includes(img));
      delete update.removeImages;
    }

    if (req.files && req.files.length > 0) {
      const newUrls  = req.files.map(f => f.path);
      currentImages  = [...currentImages, ...newUrls];
    }

    update.images    = currentImages;
    update.thumbnail = currentImages[0] || property.thumbnail;

    property = await Property.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('agent', 'firstName lastName email avatar');

    res.json({ success: true, message: 'Property updated!', property });
  } catch (err) {
    if (req.files?.length) await deleteCloudinaryImages(req.files.map(f => f.path));
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete property (also removes all images from Cloudinary)
// @route  DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    if (property.agent.toString() !== req.user.id && !['admin','super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Delete all images from Cloudinary
    const allImages = [...new Set([...(property.images || []), property.thumbnail].filter(Boolean))];
    await deleteCloudinaryImages(allImages);

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete a single image from a property
// @route  DELETE /api/properties/:id/images
const deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    if (property.agent.toString() !== req.user.id && !['admin','super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, message: 'imageUrl is required.' });

    await deleteCloudinaryImage(imageUrl);

    property.images    = (property.images || []).filter(img => img !== imageUrl);
    if (property.thumbnail === imageUrl) property.thumbnail = property.images[0] || '';
    await property.save();

    res.json({ success: true, message: 'Image deleted.', images: property.images, thumbnail: property.thumbnail });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Save / unsave property
// @route  POST /api/properties/:id/save
const toggleSaveProperty = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const pid  = req.params.id;
    const idx  = user.savedProperties.indexOf(pid);
    if (idx > -1) {
      user.savedProperties.splice(idx, 1);
      await user.save();
      return res.json({ success: true, saved: false, message: 'Removed from saved.' });
    }
    user.savedProperties.push(pid);
    await user.save();
    return res.json({ success: true, saved: true, message: 'Property saved!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Agent's own listings
// @route  GET /api/properties/my-listings
const getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ agent: req.user.id }).sort('-createdAt');
    res.json({ success: true, count: properties.length, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Analytics
// @route  GET /api/properties/analytics
const getAnalytics = async (req, res) => {
  try {
    const [total, available, sold, rented, byType, byCity, recentListings, topViewed] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'available' }),
      Property.countDocuments({ status: 'sold' }),
      Property.countDocuments({ status: 'rented' }),
      Property.aggregate([{ $group: { _id: '$propertyType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Property.aggregate([{ $group: { _id: '$city', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Property.find().sort('-createdAt').limit(5).populate('agent','firstName lastName'),
      Property.find().sort('-views').limit(5).select('title views price city thumbnail'),
    ]);
    res.json({ success: true, analytics: { total, available, sold, rented, byType, byCity, recentListings, topViewed } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, deletePropertyImage, toggleSaveProperty, getMyListings, getAnalytics,
};
