import { Router } from 'express';
import passport from '../services/auth';
import { db } from '../../db';
import { users, chatSessions, chatMessages } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    successRedirect: '/'
  })
);

// Login status route
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      isAuthenticated: true,
      user: req.user
    });
  }
  
  res.json({
    isAuthenticated: false,
    user: null
  });
});

// Logout route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get current user's chat sessions
router.get('/chat-sessions', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = (req.user as any).id;
    const sessions = await db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, userId),
      orderBy: (chatSessions, { desc }) => [desc(chatSessions.updatedAt)]
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new chat session
router.post('/chat-sessions', async (req, res) => {
  try {
    const { title, isTemporary = false } = req.body;
    
    // For authenticated users
    if (req.isAuthenticated()) {
      const userId = (req.user as any).id;
      const [session] = await db.insert(chatSessions)
        .values({
          userId,
          title: title || 'New Chat',
          isTemporary
        })
        .returning();
      
      return res.status(201).json(session);
    }
    
    // For unauthenticated users, create a temporary session
    const [session] = await db.insert(chatSessions)
      .values({
        title: title || 'Temporary Chat',
        isTemporary: true
      })
      .returning();
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat messages for a session
router.get('/chat-sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // For authenticated users, verify ownership
    if (req.isAuthenticated()) {
      const userId = (req.user as any).id;
      const session = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, parseInt(sessionId))
      });
      
      if (session && session.userId && session.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to access this chat session' });
      }
    }
    
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, parseInt(sessionId)),
      orderBy: (chatMessages, { asc }) => [asc(chatMessages.timestamp)]
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a message to a chat session
router.post('/chat-sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;
    
    // Validate session exists
    const session = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, parseInt(sessionId))
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // For authenticated users, verify ownership
    if (req.isAuthenticated() && session.userId) {
      const userId = (req.user as any).id;
      if (session.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to access this chat session' });
      }
    }
    
    // Add message
    const [message] = await db.insert(chatMessages)
      .values({
        sessionId: parseInt(sessionId),
        role,
        content
      })
      .returning();
    
    // Update session timestamp
    await db.update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, parseInt(sessionId)));
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a chat session
router.delete('/chat-sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify ownership for authenticated users
    if (req.isAuthenticated()) {
      const userId = (req.user as any).id;
      const session = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, parseInt(sessionId))
      });
      
      if (session && session.userId && session.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this chat session' });
      }
    }
    
    // Delete all messages first (cascade not automatic)
    await db.delete(chatMessages)
      .where(eq(chatMessages.sessionId, parseInt(sessionId)));
    
    // Delete the session
    await db.delete(chatSessions)
      .where(eq(chatSessions.id, parseInt(sessionId)));
    
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;