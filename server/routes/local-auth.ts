import { Router } from 'express';
import { db } from '../../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Simple local login for testing
router.post('/login', async (req, res) => {
  try {
    console.log('Local auth login request received:', req.body);
    const { username } = req.body;
    
    if (!username) {
      console.log('Username missing from request');
      return res.status(400).json({ error: 'Username is required' });
    }
    
    console.log('Checking if user exists:', username);
    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    // If user doesn't exist, create one
    if (!user) {
      console.log('User does not exist, creating new user');
      const [newUser] = await db.insert(users)
        .values({
          username,
          email: `${username}@example.com`
        })
        .returning();
      
      user = newUser;
      console.log('Created new user:', user);
    } else {
      console.log('Found existing user:', user);
    }
    
    // Log the user in
    console.log('Calling req.login with user:', user);
    console.log('Session before login:', req.session);
    
    req.login(user, (err) => {
      if (err) {
        console.error('Error in req.login():', err);
        return res.status(500).json({ error: 'Login error' });
      }
      
      console.log('Local login successful for user:', user.username);
      console.log('Session after login:', req.session);
      
      return res.json({ 
        success: true, 
        user,
        isAuthenticated: true
      });
    });
  } catch (error) {
    console.error('Local login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;