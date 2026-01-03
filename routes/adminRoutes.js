import express from 'express';
import { getAdminStats } from '../controllers/adminControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import {admin} from '../middleware/adminMiddleware.js';

const router=express.Router();

// get admin statistics
router.get("/stats",protect,admin,getAdminStats)

export default router;