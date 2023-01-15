import { isValidObjectId } from 'mongoose';
import User from '../models/User.js';

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate id param
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    // Find user by id
    const user = await User.findById(id).select('-password');
    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Send user in response
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate id param
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    // Find user by id
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
