import express from 'express';
import { currentUser, login, logout, register } from '../controller/auth';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/currentUser', currentUser);

export default router;
