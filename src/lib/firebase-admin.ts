import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

function getAdminApp(): App {
  if (!app) {
    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
    const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Variáveis de ambiente do Firebase Admin não configuradas');
    }

    const existing = getApps().find(a => a.name === '[DEFAULT]');
app = existing ?? initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    getAdminApp();
    db = getFirestore();
  }
  return db;
}