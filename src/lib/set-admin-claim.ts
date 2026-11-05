import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';

function loadEnv(path: string) {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const m = line.match(/^([^=]+)=(.*)$/s);
    if (!m) continue;
    let v = m[2]!.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]!.trim()] = v.replace(/\\n/g, '\n');
  }
  return env;
}

const env = loadEnv('.env.local');

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: env['FIREBASE_PROJECT_ID']!,
        clientEmail: env['FIREBASE_CLIENT_EMAIL']!,
        privateKey: env['FIREBASE_PRIVATE_KEY']!,
      }),
    });

const adminAuth = getAuth(app);

// ← troque pelo e-mail ou UID do seu usuário
const TARGET = process.argv[2];

if (!TARGET) {
  console.error('Uso: npx tsx src/lib/set-admin-claim.ts <email-ou-uid>');
  process.exit(1);
}

async function run() {
  const user = TARGET!.includes('@')
    ? await adminAuth.getUserByEmail(TARGET!)
    : await adminAuth.getUser(TARGET!);

  await adminAuth.setCustomUserClaims(user.uid, { admin: true, staff: false });
  console.log(`✓ admin: true setado para ${user.email ?? user.uid}`);
  console.log('Faça logout e login novamente para o token atualizar.');
}

run().catch(e => { console.error(e); process.exit(1); });