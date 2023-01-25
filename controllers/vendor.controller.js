import Vendor from '../models/Vendor.js';
import Item from '../models/Item.js';
import { isValidObjectId } from 'mongoose';

export const createVendor = async (req, res) => {
  try {
    const { name, location } = req.body;

    // check if the vendor exists
    const existingVendor = await Vendor.findOne({ name });
    if (existingVendor) {
      return res
        .status(400)
        .json({ message: 'Vendor by this name already exists' });
    }

    // create vendor
    const newVendor = new Vendor({
      name,
      location,
    });
    const savedVendor = await newVendor.save();
    res.status(201).json({
      _id: savedVendor._id,
      name: savedVendor.name,
      location: savedVendor.location,
      items: savedVendor.items,
    });
  } catch (err) {
    res.status(500).json({ messgae: err.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid vendor Id' });
    }

    // Find vendor by id and populate itemss
    const vendor = await Vendor.findById(vendorId).populate('items');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Find vendo by Id
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    // Find items associate with this vendor and unset them from the vendor
    await Item.updateMany({ vendor: vendorId }, { $unset: { vendor: '' } });

    // delete vendor
    await vendor.remove();
    res.status(200).json({ message: `Vendor successfully deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
