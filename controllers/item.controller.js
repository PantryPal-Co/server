import Item from '../models/Item.js';
import PurchaseList from '../models/PurchaseList.js';
import Vendor from '../models/Vendor.js';
import { Categories } from '../enums/categories.js';

// const categories = require('../enums/categories.js');
// Add an item to a purchase list
export const addItemToPurchaseList = async (req, res) => {
  try {
    const { name, picturePath, category, vendor, price, quantity, checked } =
      req.body;
    const { purchaseListId } = req.params;
    const vendorX = await Vendor.findById(vendor);
    const totalPrice = price * quantity;

    // check if category is a valid category
    if (!Categories[category]) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // create new item
    const newItem = new Item({
      name,
      picturePath,
      category,
      vendor,
      price,
      quantity,
      checked,
      totalPrice: totalPrice,
    });
    const savedItem = await newItem.save();

    const purchaseList = await PurchaseList.findById(purchaseListId);
    purchaseList.items.push(savedItem._id);

    // important to check for if an item is checked. That's when it will be added to the list
    purchaseList.purchaseListTotal += checked ? totalPrice : 0;

    // update vendors item array with new item
    vendorX.items.push(savedItem._id);
    await vendorX.save();
    // save the updated purchase list
    const updatedPurchaseList = await purchaseList.save();

    // send the updated purchase list and the new item as a reponse
    res.status(201).json({
      item: savedItem,
      purchaseList: updatedPurchaseList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an item from a purchase list

export const deleteItemFromPurchaseList = async (req, res) => {
  try {
    const { purchaseListId, itemId } = req.params;

    // Find purchase list by id
    const purchaseList = await PurchaseList.findById(purchaseListId);

    // Handle purchase list not found
    if (!purchaseList) {
      return res.status(404).json({ message: 'Purchase list not found' });
    }

    // Find and delete the item from the Item collection
    const deletedItem = await Item.findByIdAndDelete(itemId);

    // Handle item not found
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Find the index of the item in the purchase lists items array
    const itemIndex = purchaseList.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    // Remove the item from the items array
    purchaseList.items.splice(itemIndex, 1);

    // Update the purchase list total
    purchaseList.purchaseListTotal -= deletedItem.totalPrice;

    // Save the updated purchase list
    const updatedPurchaseList = await purchaseList.save();

    // Send the updated purchase list and deleted item as the response
    res.status(200).json({
      item: deletedItem,
      purchaseList: updatedPurchaseList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
