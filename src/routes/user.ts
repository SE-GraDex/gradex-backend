const express = require('express')
const router = express.Router()
const { getUser, getAllUsers, addUser } = require('../controller/user')

router.get('/getAllUsers', getAllUsers);

router.get('/getUser/:id', getUser);

router.post('/addUser', addUser);

module.exports = router
