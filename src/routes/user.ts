import express from 'express';
import { autoFill, getUser, getAllUsers, addUser, currentDailyOrderList, addDailyOrder, updateOrderCalendar, addUserPackage, getCurrentUserPackage } from '../controller/user';

const router = express.Router();

router.get('/getAllUsers', getAllUsers);

router.get('/getUser/:id', getUser);

router.post('/addUser', addUser);

router.get('/currentDailyOrderList', currentDailyOrderList);

router.post('/addDailyOrder', addDailyOrder);

router.get('/updateOrderCalendar', updateOrderCalendar);

router.get('/getCurrentUserPackage', getCurrentUserPackage);

router.post('/addUserPackage', addUserPackage);

router.post('/autoFill', autoFill);

export default router;
