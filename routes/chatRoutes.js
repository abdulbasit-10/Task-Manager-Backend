const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getGroupMessages, getContacts, getDirectMessages } = require('../controllers/chatControllers');

const router = express.Router();

router.get('/group', protect, getGroupMessages);
router.get('/contacts', protect, getContacts);
router.get('/dm/:userId', protect, getDirectMessages);

module.exports = router;
