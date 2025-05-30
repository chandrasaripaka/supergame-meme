import { User } from '../../shared/schema';

declare global {
  namespace Express {
    interface User extends User {}
    
    interface Request {
      temporarySession?: boolean;
    }
  }
}

export {};