const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getGroupMessages } = require('../controllers/chatControllers');

const router = express.Router();

router.get('/group', protect, getGroupMessages);

module.exports = router;
