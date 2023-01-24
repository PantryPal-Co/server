import PurchaseList from '../models/PurchaseList.js';
import User from '../models/User.js';
import { isValidObjectId } from 'mongoose';

// READ
// Get details
export const getPurchaseListDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate purchase list id
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid purchase list id' });
    }
    // Find purchase list by id
    const purchaseList = await PurchaseList.findById(id);
    // Handle purchase list not found
    if (!purchaseList) {
      return res.status(404).json({ message: 'Purchase list not found' });
    }
    res.status(200).json(purchaseList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get purchase lists
export const getPurchaseLists = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId param
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    // Find user by id and populate purchase lists
    const user = await User.findById(userId).populate('purchaseLists');
    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // map and return appropriate properties from the purchase lists
    const purchaseLists = user.purchaseLists.map((purchaseList) => {
      return {
        name: purchaseList.name,
        purchaseListTotal: purchaseList.purchaseListTotal,
      };
    });
    res.status(200).json(purchaseLists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a purchase list
export const createPurchaseList = async (req, res) => {
  try {
    const { name, user } = req.body;
    // const { userId } = req.decoded;
    const dbUser = await User.findById(user);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const purchaseList = new PurchaseList({
      name,
      user: dbUser,
      purchaseListTotal: 0,
      items: [],
      createdAt: Date.now(),
    });

    const savedPurchaseList = await purchaseList.save();
    dbUser.purchaseLists.push(savedPurchaseList._id);
    await dbUser.save();
    res.status(201).json({
      _id: savedPurchaseList._id,
      name: savedPurchaseList.name,
      purchaseListTotal: savedPurchaseList.purchaseListTotal,
      items: savedPurchaseList.items,
      createdAt: savedPurchaseList.createdAt,
      user: savedPurchaseList.user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a purchase list
export const deletePurchaseList = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    const dbUser = await User.findById(user);
    if (!dbUser) {
      res.status(404).json({ message: `User does not exist` });
    }
    // Validate purchase list id
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid purchase list id' });
    }
    // Find purchase list by id
    const purchaseList = await PurchaseList.findById(id);
    // Handle purchase list not found
    if (!purchaseList) {
      return res.status(404).json({ message: 'Purchase list not found' });
    }
    // Check if the user is the owner of the purchase list
    /*if (req.user._id.toString() !== purchaseList.user.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }*/
    if (user.toString() !== purchaseList.user.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Delete purchase list
    await purchaseList.remove();
    dbUser.purchaseLists.splice(dbUser.purchaseLists.indexOf(id), 1);
    await dbUser.save();
    res.status(200).json({ message: `${purchaseList.name} list deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
