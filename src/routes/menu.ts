import express from 'express';
import { addMenu, deleteMenu, getAllMenus, getMenuById } from '../controller/menu';

const router = express.Router();

router.post('/addmenu', addMenu);
router.delete('/menu/:id', deleteMenu);
router.get('/getallmenu', getAllMenus);
router.get('/menu/:id', getMenuById);

export default router;
