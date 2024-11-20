import express from 'express';
import { getUser, getAllUsers, addUser, currentDailyOrderList } from '../controller/user';

const router = express.Router();

router.get('/getAllUsers', getAllUsers);

router.get('/getUser/:id', getUser);

router.post('/addUser', addUser);

router.get('/currentDailyOrderList', currentDailyOrderList);

export default router;
