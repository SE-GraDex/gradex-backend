import { createShipping, deleteShippingById, getAllShippings, updateShipping } from "@/controller/shipping";
import express from "express";


const router = express.Router();
router.post('/createShipping',createShipping);
router.get('/getAllShippings',getAllShippings);
router.put('/updateShipping/:tracking_number',updateShipping);
router.delete('/deleteShippingById/:id',deleteShippingById);
export default router;