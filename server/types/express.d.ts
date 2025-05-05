import { User } from '../../shared/schema';
import 'express-session';

declare global {
  namespace Express {
    interface User extends User {}
    
    interface Request {
      temporarySession?: boolean;
    }
  }
}

// Extend the express-session SessionData interface
declare module 'express-session' {
  interface SessionData {
    oauthCallbackUrl?: string;
  }
}

export {};