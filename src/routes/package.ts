import { createPackage, deleteExpiredPackages, deletePackageById, getAllPackages } from "@/controller/package";
import express from "express";


const router = express.Router();

router.post('/createPackage', createPackage);
router.get('/getAllPackages', getAllPackages);
router.delete('/deleteExpiredPackages', deleteExpiredPackages);
router.delete('/deletePackageById/:id', deletePackageById);

export default router;