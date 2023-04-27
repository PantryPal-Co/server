import PurchaseList from '../models/PurchaseList.js';
import User from '../models/User.js';
import { isValidObjectId } from 'mongoose';
import Item from '../models/Item.js';

// READ
// Get purchase list details
export const getPurchaseListDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate purchase list id
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid purchase list id' });
    }
    // Find purchase list by id
    const purchaseList = await PurchaseList.findById(id).populate({
      path: 'items',
      select: 'name quantity price category checked',
    });
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
  const selectedMonth = parseInt(req.query.month);
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

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

    // Find purchase lists by user id with pagination
    const purchaseListsQuery = await PurchaseList.find({
      user: user._id,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sorting by descending order of creation date

    // map and return appropriate properties from the purchase lists
    const purchaseLists = purchaseListsQuery.map((purchaseList) => {
      return {
        _id: purchaseList._id,
        name: purchaseList.name,
        purchaseListTotal: purchaseList.purchaseListTotal,
        createdAt: purchaseList.createdAt,
      };
    });

    // Calculate grand total for all purchase lists
    const grandTotal = user.purchaseLists.reduce(
      (total, list) => total + list.purchaseListTotal,
      0
    );

    // Calculate total for the selected month
    const totalThisMonth = user.purchaseLists.reduce((total, list) => {
      if (new Date(list.createdAt).getMonth() === selectedMonth) {
        return total + list.purchaseListTotal;
      }
      return total;
    }, 0);

    // Count the total number of purchase lists
    const totalPurchaseLists = await PurchaseList.countDocuments({
      user: user._id,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalPurchaseLists / limit);

    // Return paginated purchase lists with meta data
    res.status(200).json({
      purchaseLists,
      pageInfo: {
        currentPage: page,
        totalPages,
        totalItems: totalPurchaseLists,
      },
      grandTotal,
      totalThisMonth,
    });
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

// Update a purchase list

export const updatePurchaseList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, items, purchaseListTotal } = req.body;

    let purchaseList;
    try {
      purchaseList = await PurchaseList.findById(id);
    } catch (error) {
      return res.status(500).json({ error: 'Error finding purchase list' });
    }

    if (!purchaseList) {
      return res.status(404).json({ error: 'Purchase list not found' });
    }

    if (req.user.id !== purchaseList.user.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (name) {
      purchaseList.name = name;
    }

    for (const updatedItem of items) {
      await Item.findByIdAndUpdate(updatedItem._id, updatedItem);
    }

    purchaseList.items = items.map((item) => item._id);
    purchaseList.purchaseListTotal = purchaseListTotal;

    let updatedPurchaseList;
    try {
      updatedPurchaseList = await purchaseList.save();
    } catch (error) {
      return res.status(500).json({ error: 'Error saving purchase list' });
    }

    let populatedPurchaseList;
    try {
      populatedPurchaseList = await PurchaseList.findById(
        updatedPurchaseList._id
      ).populate([{ path: 'items', path: 'user' }]);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Error populating purchase list fields' });
    }

    res.json(populatedPurchaseList);
  } catch (error) {
    console.error('Error in updatePurchaseList:', error);
    res.status(500).json({ error: 'Error updating purchase list' });
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
