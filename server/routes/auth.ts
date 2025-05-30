import { Router } from 'express';
import passport from '../services/auth';
import { db } from '../../db';
import { users, chatSessions, chatMessages } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  const hostname = req.headers.host || '';
  const isReplit = process.env.REPLIT_SLUG || hostname.includes('replit');
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For local development
  const localCallbackUrl = `http://${req.headers.host}/auth/google/callback`;
  
  // For Replit development environment
  const devCallbackUrl = process.env.REPLIT_SLUG 
    ? `https://${process.env.REPLIT_SLUG}.replit.dev/auth/google/callback` 
    : localCallbackUrl;
    
  // For Replit production environment
  const prodCallbackUrl = process.env.REPLIT_SLUG 
    ? `https://${process.env.REPLIT_SLUG}.replit.app/auth/google/callback` 
    : localCallbackUrl;
  
  // Determine which URL we're actually using
  const actualCallbackUrl = isReplit
    ? (isProduction ? prodCallbackUrl : devCallbackUrl)
    : localCallbackUrl;
    
  console.log('Starting Google OAuth flow. Authentication callback URLs:');
  console.log('Dev URL:', devCallbackUrl);
  console.log('Production URL:', prodCallbackUrl);
  console.log('Current environment:', process.env.NODE_ENV || 'development');
  console.log('Make sure one of these matches EXACTLY what you configured in Google Cloud Console');
  
  // Add this URL to your Google Cloud Console OAuth configuration
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('Google OAuth callback received at URL:', req.originalUrl);
  console.log('Full callback URL:', `${req.protocol}://${req.headers.host}${req.originalUrl}`);
  
  // Handle authentication with more detailed error reporting
  passport.authenticate('google', (err: any, user: any, info: any) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect('/login?error=' + encodeURIComponent('Authentication failed'));
    }
    
    if (!user) {
      console.error('Google OAuth failed - No user returned:', info);
      return res.redirect('/login?error=' + encodeURIComponent('Authentication failed'));
    }
    
    // Log in the authenticated user
    req.login(user, (err) => {
      if (err) {
        console.error('Error in req.login():', err);
        return res.redirect('/login?error=' + encodeURIComponent('Login error'));
      }
      
      console.log('Google OAuth authentication successful for user:', user.username);
      return res.redirect('/');
    });
  })(req, res, next);
});

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