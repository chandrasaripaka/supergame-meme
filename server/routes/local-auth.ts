import { Router } from 'express';
import { db } from '../../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Simple local login for testing
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    // If user doesn't exist, create one
    if (!user) {
      const [newUser] = await db.insert(users)
        .values({
          username,
          email: `${username}@example.com`
        })
        .returning();
      
      user = newUser;
    }
    
    // Log the user in
    req.login(user, (err) => {
      if (err) {
        console.error('Error in req.login():', err);
        return res.status(500).json({ error: 'Login error' });
      }
      
      return res.json({ 
        success: true, 
        user
      });
    });
  } catch (error) {
    console.error('Local login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;