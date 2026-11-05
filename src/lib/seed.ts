import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

function loadEnvFile(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/s);
    if (!match) continue;
    let val = match[2]!.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]!.trim()] = val.replace(/\\n/g, '\n');
  }
  return env;
}

const env = loadEnvFile('.env.local');

const projectId   = env['FIREBASE_PROJECT_ID'];
const clientEmail = env['FIREBASE_CLIENT_EMAIL'];
const privateKey  = env['FIREBASE_PRIVATE_KEY'];

if (!projectId || !clientEmail || !privateKey) {
  console.error('Erro: Verifique se o ficheiro .env.local contém FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.');
  process.exit(1);
}         

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = getFirestore(app);

async function seed() {
  // store_settings (documento único com id fixo "main")
  await db.collection('store_settings').doc('main').set({
    establishment_name: 'FH Foods',
    is_open: true,
    demo_mode: true,
    opens_at: '18:00',
    closes_at: '23:00',
    delivery_fee: 5,
    free_delivery_minimum: 80,
    delivery_zones_enabled: false,
    scheduling_enabled: false,
    loyalty_enabled: false,
    points_per_real: 1,
    reward_points: 100,
    reward_value: 10,
    club_enabled: false,
    dine_in_enabled: true,
    share_cart_enabled: false,
    auto_print_enabled: false,
    paper_width: 80,
    demand_mode: 'auto',
    logo_url: '',
    whatsapp_number: '',
    daily_goal: 500,
    monthly_goal: 15000,
  });

  // store_license
  await db.collection('store_license').doc('main').set({
    mode: 'demonstration',
    due_at: null,
    monthly_price: 0,
  });

  // categories
  const categories = [
    { id: 'classicas', name: 'Clássicas', sort_order: 1 },
    { id: 'autorais', name: 'Autorais', sort_order: 2 },
    { id: 'doces', name: 'Doces', sort_order: 3 },
    { id: 'bebidas', name: 'Bebidas', sort_order: 4 },
  ];
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat);
  }

  // products
  const products = [
    {
      name: 'Calabresa',
      description: 'Calabresa fatiada, cebola e azeitonas sobre molho de tomate',
      price: 49.9,
      category: 'Clássicas',
      image_url: '',
      video_url: '',
      is_active: true,
      active: true,
      half_half_allowed: true,
      sort_order: 1,
      featured: true,
      cost: 18,
      image_key: '',
    },
    {
      name: 'Margherita',
      description: 'Molho de tomate, mussarela fresca e manjericão',
      price: 47.9,
      category: 'Clássicas',
      image_url: '',
      video_url: '',
      is_active: true,
      active: true,
      half_half_allowed: true,
      sort_order: 2,
      featured: true,
      cost: 15,
      image_key: '',
    },
    {
      name: '4 Queijos',
      description: 'Mussarela, parmesão, provolone e catupiry',
      price: 54.9,
      category: 'Clássicas',
      image_url: '',
      video_url: '',
      is_active: true,
      active: true,
      half_half_allowed: true,
      sort_order: 3,
      featured: false,
      cost: 20,
      image_key: '',
    },
    {
      name: 'Coca-Cola 2L',
      description: 'Garrafa 2 litros gelada',
      price: 14.9,
      category: 'Bebidas',
      image_url: '',
      video_url: '',
      is_active: true,
      active: true,
      half_half_allowed: false,
      sort_order: 10,
      featured: false,
      cost: 6,
      image_key: '',
    },
    {
      name: 'Suco de Laranja 500ml',
      description: 'Suco natural gelado',
      price: 9.9,
      category: 'Bebidas',
      image_url: '',
      video_url: '',
      is_active: true,
      active: true,
      half_half_allowed: false,
      sort_order: 11,
      featured: false,
      cost: 3,
      image_key: '',
    },
  ];

for (const product of products) {
  await db.collection('products').add(product);
}

  // dining_tables
  for (let i = 1; i <= 5; i++) {
    await db.collection('dining_tables').add({
      label: `Mesa ${i}`,
      active: true,
      current_session_id: null,
      session_started_at: null,
    });
  }

  console.log('Seed concluído com sucesso!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });