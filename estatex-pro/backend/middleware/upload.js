const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ─── Storage: property images ─────────────────────────────────────────────────
const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'estatex_pro/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation:  [
      { width: 1200, height: 800, crop: 'fill', gravity: 'auto', quality: 'auto:good' },
    ],
    public_id: `property_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
  }),
});

// ─── Storage: avatars ─────────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          'estatex_pro/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' },
    ],
    public_id: `avatar_${req.user?.id}_${Date.now()}`,
  }),
});

// ─── File filter ──────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (/jpeg|jpg|png|gif|webp/.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp, gif) are allowed.'), false);
};

// ─── Multer instances ─────────────────────────────────────────────────────────
const uploadProperty = multer({
  storage:    propertyStorage,
  limits:     { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadAvatar = multer({
  storage:    avatarStorage,
  limits:     { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// ─── Helper: delete one image from Cloudinary by its URL ─────────────────────
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;
    const parts    = imageUrl.split('/');
    const upIdx    = parts.indexOf('upload');
    if (upIdx === -1) return;
    const after    = parts.slice(upIdx + 1);
    const startIdx = after[0]?.match(/^v\d+$/) ? 1 : 0;
    const publicId = after.slice(startIdx).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
    console.log('Deleted from Cloudinary:', publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

// ─── Helper: delete many images ───────────────────────────────────────────────
const deleteCloudinaryImages = async (urls = []) => {
  await Promise.all(urls.map(deleteCloudinaryImage));
};

module.exports = { uploadProperty, uploadAvatar, deleteCloudinaryImage, deleteCloudinaryImages };
