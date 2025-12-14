import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
} from '../controllers/chat.controller';

const chatRouter = Router();

// All chat routes are protected
chatRouter.use(isAuthenticated);

// POST /api/v1/chat/conversations - Start a new conversation
chatRouter.post('/conversations', startConversation);

// GET /api/v1/chat/conversations - List all user's conversations
chatRouter.get('/conversations', getConversations);

// GET /api/v1/chat/conversations/:id/messages - Get message history
chatRouter.get('/conversations/:id/messages', getMessages);

// POST /api/v1/chat/conversations/:id/messages - Send a new message
chatRouter.post('/conversations/:id/messages', sendMessage);

export default chatRouter;
