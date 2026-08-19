import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'almagro-monumental-audioguia';

interface MonumentDocument {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  shortDescription: string;
  historyTextEs: string;
  image: string;
  thumbnail: string;
  address: string;
  latitude: number;
  longitude: number;
  order: number;
  century?: string;
  tag?: string;
  visitDurationMinutes?: number;
  audio: {
    es: string;
    en: string;
    fr: string;
    it: string;
    de: string;
    zh: string;
  };
}

/**
 * Inicializa Firebase Admin de forma segura buscando credenciales en:
 * 1. Variable de entorno GOOGLE_APPLICATION_CREDENTIALS (ruta a archivo .json)
 * 2. Archivo local 'serviceAccountKey.json' o 'service-account.json' en la raíz del proyecto
 * 3. Variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY (contenido JSON)
 * 4. applicationDefault() de Google Cloud
 */
function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // 1. Comprobar si existe GOOGLE_APPLICATION_CREDENTIALS
  const envCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envCredentialsPath && fs.existsSync(envCredentialsPath)) {
    console.log(`🔑 Usando credenciales desde GOOGLE_APPLICATION_CREDENTIALS: ${envCredentialsPath}`);
    return initializeApp({
      credential: cert(envCredentialsPath),
      projectId: PROJECT_ID,
    });
  }

  // 2. Comprobar archivos locales estándar
  const localKeyPaths = [
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), 'service-account.json'),
  ];

  for (const keyPath of localKeyPaths) {
    if (fs.existsSync(keyPath)) {
      console.log(`🔑 Usando archivo de credenciales local: ${path.basename(keyPath)}`);
      return initializeApp({
        credential: cert(keyPath),
        projectId: PROJECT_ID,
      });
    }
  }

  // 3. Comprobar variable con contenido JSON directo
  const jsonContent = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (jsonContent) {
    try {
      const parsedKey = JSON.parse(jsonContent);
      console.log('🔑 Usando credenciales desde variable FIREBASE_SERVICE_ACCOUNT_KEY');
      return initializeApp({
        credential: cert(parsedKey),
        projectId: PROJECT_ID,
      });
    } catch {
      console.warn('⚠️ No se pudo parsear FIREBASE_SERVICE_ACCOUNT_KEY como JSON válido.');
    }
  }

  // 4. Fallback a credenciales por defecto del entorno
  try {
    return initializeApp({
      credential: applicationDefault(),
      projectId: PROJECT_ID,
    });
  } catch {
    throw new Error(
      `❌ No se encontraron credenciales de Firebase Admin (Service Account).\n` +
      `Por favor, coloca tu archivo 'serviceAccountKey.json' en la raíz del proyecto o define la variable GOOGLE_APPLICATION_CREDENTIALS.\n` +
      `Consulta las instrucciones proporcionadas para generar la clave en la Consola de Firebase.`
    );
  }
}

export async function runAdminMigration() {
  console.log('====================================================');
  console.log('🚀 MIGRACIÓN CONTROLADA CON FIREBASE ADMIN SDK');
  console.log(`🎯 Proyecto: ${PROJECT_ID}`);
  console.log('====================================================\n');

  // 1. Inicialización
  initFirebaseAdmin();
  const db = getFirestore();

  // 2. Cargar archivo de datos
  const seedPath = path.join(process.cwd(), 'scripts', 'monuments-seed.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`❌ No se encontró el archivo de datos en: ${seedPath}`);
  }

  const rawData = fs.readFileSync(seedPath, 'utf-8');
  const monumentsMap: Record<string, MonumentDocument> = JSON.parse(rawData);
  const monumentsList: MonumentDocument[] = Object.values(monumentsMap).sort(
    (a, b) => a.order - b.order
  );

  console.log(`📦 Se han cargado ${monumentsList.length} monumentos desde 'scripts/monuments-seed.json'.\n`);

  // 3. Escritura idempotente con IDs explícitos
  let writtenCount = 0;
  for (const monument of monumentsList) {
    const docId = monument.id;
    const docRef = db.collection('monuments').doc(docId);

    await docRef.set(monument, { merge: true });
    console.log(
      `✅ [${monument.order}/6] Documento '${docId}' guardado exitosamente: "${monument.name}"`
    );
    writtenCount++;
  }

  console.log(`\n🎉 Migración completada con éxito: ${writtenCount} documentos escritos en Firestore.`);

  // 4. Verificación de lectura directa desde Firestore
  console.log('\n🔍 Verificando colección en Cloud Firestore...');
  const snapshot = await db.collection('monuments').orderBy('order', 'asc').get();

  console.log(`📊 Documentos encontrados en la colección 'monuments': ${snapshot.size}`);
  snapshot.forEach((doc) => {
    const d = doc.data();
    console.log(`   - ID: [${doc.id}] | Orden: ${d.order} | Nombre: ${d.name}`);
  });

  console.log('\n✨ Todos los monumentos están disponibles en Firestore de forma segura.');
}

// Ejecución por CLI
if (typeof process !== 'undefined' && process.argv[1]?.includes('seedMonumentsAdmin')) {
  runAdminMigration()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n' + (err instanceof Error ? err.message : String(err)));
      process.exit(1);
    });
}
