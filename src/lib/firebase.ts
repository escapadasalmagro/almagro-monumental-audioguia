import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBIoXH15m2jH5my8Fele5z8LXoRlsenn2M',
  authDomain: 'almagro-monumental-audioguia.firebaseapp.com',
  projectId: 'almagro-monumental-audioguia',
  storageBucket: 'almagro-monumental-audioguia.firebasestorage.app',
  messagingSenderId: '920981316189',
  appId: '1:920981316189:web:9cf580869a2485581c23b4',
};

// Inicializar Firebase una sola vez
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Exportar la instancia de Cloud Firestore
export const db = getFirestore(app);
