const express = require('express');
const router  = express.Router();
const {
  getProperties, getProperty, createProperty, updateProperty,
  deleteProperty, deletePropertyImage, toggleSaveProperty, getMyListings, getAnalytics,
} = require('../controllers/propertyController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadProperty } = require('../middleware/upload');

router.get('/',              optionalAuth, getProperties);
router.get('/analytics',     protect, authorize('super_admin','admin','agent','property_manager'), getAnalytics);
router.get('/my-listings',   protect, authorize('agent','admin','super_admin','property_manager'), getMyListings);
router.get('/:id',           optionalAuth, getProperty);

router.post('/',
  protect, authorize('agent','admin','super_admin','property_manager'),
  uploadProperty.array('images', 10),
  createProperty
);

router.put('/:id',
  protect, authorize('agent','admin','super_admin','property_manager'),
  uploadProperty.array('images', 10),
  updateProperty
);

router.delete('/:id',        protect, authorize('agent','admin','super_admin'), deleteProperty);
router.delete('/:id/images', protect, authorize('agent','admin','super_admin','property_manager'), deletePropertyImage);
router.post('/:id/save',     protect, toggleSaveProperty);

module.exports = router;
