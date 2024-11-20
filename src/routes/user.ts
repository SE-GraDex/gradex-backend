import express from 'express';
import { getUser, getAllUsers, addUser, currentDailyOrderList, addDailyOrder, updateOrderCalendar } from '../controller/user';

const router = express.Router();

router.get('/getAllUsers', getAllUsers);

router.get('/getUser/:id', getUser);

router.post('/addUser', addUser);

router.get('/currentDailyOrderList', currentDailyOrderList);

router.post('/addDailyOrder', addDailyOrder);

router.get('/updateOrderCalendar', updateOrderCalendar);

export default router;
