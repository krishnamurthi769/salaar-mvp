import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    workspaceId?: string; // Appended if checking cross-service token
  };
}

// 1. Firebase Token Validation (For Frontend -> Backend requests)
export const requireFirebaseAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (!firebaseAuth) throw new Error("Firebase Admin not configured");
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

// 2. Internal Service JWT Validation (For cross-service backend communication)
export const requireInternalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['x-internal-token'] as string;
  const INTERNAL_SECRET = process.env.INTERNAL_JWT_SECRET;

  if (!authHeader || !INTERNAL_SECRET) {
    res.status(403).json({ error: 'Forbidden: Missing internal token' });
    return;
  }

  try {
    const payload = jwt.verify(authHeader, INTERNAL_SECRET);
    req.user = payload as { uid: string, workspaceId: string };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden: Invalid internal token' });
  }
};
