import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Adjust if run from root vs service directory

if (!admin.apps.length) {
  // Try to initialize using standard fallback or explicitly provided env vars
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
    } else {
      admin.initializeApp(); // Assuming GOOGLE_APPLICATION_CREDENTIALS is set, or running in GCP
    }
  } catch (error) {
    console.warn("Firebase Admin Initialization Warning: ", error);
  }
}

export const firebaseAuth = admin.apps.length ? admin.auth() : null;
