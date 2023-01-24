import express from 'express';
import { getUser, updateUser } from '../controllers/users.controller.js';
import {
  getPurchaseListDetails,
  getPurchaseLists,
  createPurchaseList,
  //   updatePurchaseList,
  deletePurchaseList,
} from '../controllers/purchaseList.controller.js';
import { deleteItemFromPurchaseList } from '../controllers/item.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
// READ
router.get('/:id', verifyToken, getUser);
router.get('/:id/listdetail', verifyToken, getPurchaseListDetails);
router.get('/:userId', verifyToken, getPurchaseLists);

// CREATE
router.post('/create', verifyToken, createPurchaseList);

// UPDATE
router.patch('/update/:id', verifyToken, updateUser);

// DELETE
// Remember to add verifyToken
router.delete('/delete/:id', verifyToken, deletePurchaseList);
router.delete(
  '/:purchaseListId/deleteItem/:itemId',
  verifyToken,
  deleteItemFromPurchaseList
);

export default router;
