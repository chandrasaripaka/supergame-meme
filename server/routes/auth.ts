import { Router } from 'express';
import passport from '../services/auth';
import { db } from '../../db';
import { users, chatSessions, chatMessages } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Use consistent callback URL logic
  const callbackUrl = process.env.NODE_ENV === 'production' 
    ? 'https://wander-notes.com/auth/google/callback'
    : 'http://localhost:5000/auth/google/callback';
  
  console.log('Starting Google OAuth flow');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Callback URL:', callbackUrl);
  console.log('Make sure this matches EXACTLY what you configured in Google Cloud Console');
  
  // Standard authentication - we're using @types/passport-google-oauth20
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  // Use consistent callback URL logic
  const callbackUrl = process.env.NODE_ENV === 'production' 
    ? 'https://wander-notes.com/auth/google/callback'
    : 'http://localhost:5000/auth/google/callback';
  
  console.log('Google OAuth callback received');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Original URL:', req.originalUrl);
  console.log('Expected callback URL:', callbackUrl);
  
  // Handle authentication without option overrides to avoid TypeScript errors
  passport.authenticate('google', (err: any, user: any, info: any) => {
    console.log('Google OAuth callback - Error:', err);
    console.log('Google OAuth callback - User:', user);
    console.log('Google OAuth callback - Info:', info);
    console.log('Google OAuth callback - Query params:', req.query);
    
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect('/login?error=' + encodeURIComponent('Authentication error: ' + err.message));
    }
    
    if (!user) {
      console.error('Google OAuth failed - No user returned:', info);
      return res.redirect('/login?error=' + encodeURIComponent('Authentication failed: ' + (info?.message || 'Unknown error')));
    }
    
    // Log in the authenticated user
    req.login(user, (err) => {
      if (err) {
        console.error('Error in req.login():', err);
        return res.redirect('/login?error=' + encodeURIComponent('Login error: ' + err.message));
      }
      
      console.log('Google OAuth authentication successful for user:', user.username);
      console.log('Session after login:', req.session);
      console.log('isAuthenticated after login:', req.isAuthenticated());
      return res.redirect('/');
    });
  })(req, res, next);
});

// Login status route
router.get('/status', (req, res) => {
  console.log('Auth status check - Session ID:', req.sessionID);
  console.log('Auth status check - Session exists:', !!req.session);
  console.log('Auth status check - Session passport:', req.session && 'passport' in req.session ? req.session.passport : 'none');
  console.log('Auth status check - isAuthenticated:', req.isAuthenticated());
  console.log('Auth status check - User:', req.user);
  
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

// Debug route to show current callback URL configuration
router.get('/debug', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use consistent callback URL logic
  const callbackUrl = isProduction 
    ? 'https://wander-notes.com/auth/google/callback'
    : 'http://localhost:5000/auth/google/callback';
  
  res.json({
    environment: {
      callbackUrl,
      isProduction,
      nodeEnv: process.env.NODE_ENV
    },
    googleConfig: {
      clientIdConfigured: !!process.env.GOOGLE_CLIENT_ID,
      clientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0
    },
    instructions: [
      `1. Go to Google Cloud Console: https://console.cloud.google.com/`,
      `2. Navigate to APIs & Services → Credentials`,
      `3. Click on your OAuth 2.0 Client ID`,
      `4. Add these URLs to 'Authorized redirect URIs':`,
      `   - Production: https://wander-notes.com/auth/google/callback`,
      `   - Development: http://localhost:5000/auth/google/callback`,
      `5. Click Save`
    ]
  });
});

// Test authentication route for development
router.post('/test-login', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Test login not available in production' });
  }

  try {
    // Find or create a test user
    let testUser = await db.query.users.findFirst({
      where: eq(users.email, 'test@wandernotes.com')
    });

    if (!testUser) {
      const [createdUser] = await db.insert(users).values({
        username: 'Test User',
        email: 'test@wandernotes.com',
        googleId: 'test-google-id'
      }).returning();
      testUser = createdUser;
    }

    // Log in the test user
    req.login(testUser, (err) => {
      if (err) {
        console.error('Test login error:', err);
        return res.status(500).json({ error: 'Test login failed' });
      }
      
      console.log('Test user logged in successfully:', testUser.username);
      res.json({
        success: true,
        message: 'Test login successful',
        user: testUser
      });
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ error: 'Test login failed' });
  }
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