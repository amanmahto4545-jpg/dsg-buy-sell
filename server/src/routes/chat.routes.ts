import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    getUnseenMessageCount,
    markMessagesAsRead,
} from '../controllers/chat.controller';

const chatRouter = Router();

// All chat routes are protected
chatRouter.use(isAuthenticated);

// GET /api/v1/chat/unseen/count - Get unread message count (place before dynamic routes)
chatRouter.get('/unseen/count', getUnseenMessageCount);

// POST /api/v1/chat/conversations - Start a new conversation
chatRouter.post('/conversations', startConversation);

// GET /api/v1/chat/conversations - List all user's conversations
chatRouter.get('/conversations', getConversations);

// GET /api/v1/chat/conversations/:id/messages - Get message history
chatRouter.get('/conversations/:id/messages', getMessages);

// POST /api/v1/chat/conversations/:id/messages - Send a new message
chatRouter.post('/conversations/:id/messages', sendMessage);

// PUT /api/v1/chat/conversations/:id/read - Mark messages as read
chatRouter.put('/conversations/:id/read', markMessagesAsRead);

export default chatRouter;
