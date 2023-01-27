import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';

import {
  createVendor,
  getVendors,
  getVendorById,
  deleteVendor,
} from '../controllers/vendor.controller.js';

const router = express.Router();

// Add a vendor
router.post('/addVendor', verifyToken, createVendor);

// Get all vendors
router.get('/', verifyToken, getVendors);
router.get('/:vendorId', verifyToken, getVendorById);

// delete vendor
router.delete('/:vendorId/delete', verifyToken, deleteVendor);

// update vendor
// router.patch('/:vendorId/update', verifyToken, updateVendorDetails)

export default router;
