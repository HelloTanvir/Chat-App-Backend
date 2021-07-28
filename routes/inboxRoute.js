const router = require('express').Router();

const {
    addConversation,
    getMessages,
    sendMessage,
    getConversations,
} = require('../controllers/inboxController');
const attachmentUpload = require('../middleware/attachmentUpload');
const checkLogin = require('../middleware/checkLogin');

// get all conversations
router.get('/conversations', checkLogin, getConversations);

// add conversation
router.post('/conversation', checkLogin, addConversation);

// get messages of a conversation
router.get('/messages/:conversation_id', checkLogin, getMessages);

// send message
router.post('/message', checkLogin, attachmentUpload, sendMessage);

module.exports = router;
