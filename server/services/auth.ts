import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users, insertUserSchema } from '../../shared/schema';

// Setup Passport serialization and deserialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    done(null, user || undefined);
  } catch (error) {
    done(error, undefined);
  }
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
      // Add the following properties to handle redirect issues
      proxy: true, // Trust the reverse proxy
      passReqToCallback: true // Allow access to the request object
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by Google ID
        let user = await db.query.users.findFirst({
          where: eq(users.googleId, profile.id)
        });

        // If no user found with this Google ID, check by email
        if (!user && profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await db.query.users.findFirst({
            where: eq(users.email, email)
          });
        }

        // If no user found, create a new one
        if (!user) {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const displayName = profile.displayName || 'Google User';
          const email = profile.emails[0].value;
          const profilePicture = profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : undefined;

          // Create new user
          const newUser = {
            username: displayName,
            email: email,
            googleId: profile.id,
            profilePicture: profilePicture
          };

          // Validate and insert user
          const validatedUser = insertUserSchema.parse(newUser);
          const [createdUser] = await db.insert(users).values(validatedUser).returning();
          
          return done(null, createdUser);
        }

        // If user exists but doesn't have googleId, update it
        if (user && !user.googleId) {
          const [updatedUser] = await db
            .update(users)
            .set({ 
              googleId: profile.id,
              profilePicture: profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : user.profilePicture
            })
            .where(eq(users.id, user.id))
            .returning();
          
          return done(null, updatedUser);
        }

        // Return existing user
        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Middleware to create or continue a temporary chat session
export const createTemporarySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If user is not authenticated, add a flag to the request
    if (!req.isAuthenticated()) {
      req.temporarySession = true;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default passport;