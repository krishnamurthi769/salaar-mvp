import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { dbPool } from '../config/db';
import jwt from 'jsonwebtoken';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountJson)) });
    } else {
      admin.initializeApp();
    }
  } catch (err) {}
}

export const firebaseAuth = admin.apps.length ? admin.auth() : null;

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; email?: string; };
}

export const requireFirebaseAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return void res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });

  const token = authHeader.split('Bearer ')[1];
  try {
    if (!firebaseAuth) throw new Error("Firebase not initialized");
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

export const resolvePgUserId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const firebaseUid = req.user?.uid;
  if (!firebaseUid) return void res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await dbPool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (result.rowCount === 0) return void res.status(404).json({ error: 'User not found in DB' });
    res.locals.pgUserId = result.rows[0].id;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error resolving user' });
  }
};
