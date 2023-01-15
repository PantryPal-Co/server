import express from 'express';
import { getUser, updateUser } from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
// READ
router.get('/:id', verifyToken, getUser);

// UPDATE
router.patch('/update/:id', verifyToken, updateUser);

export default router;
