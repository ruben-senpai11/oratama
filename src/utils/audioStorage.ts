import { RecordedVoice } from '../types';

const DB_NAME = 'oratama_db';
const DB_VERSION = 1;
const STORE_NAME = 'author_voices';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB non supporté sur ce navigateur'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'bookId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère un enregistrement vocal d'auteur pour un livre donné
 */
export async function getRecordedVoice(bookId: string): Promise<RecordedVoice | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(bookId);

      request.onsuccess = () => {
        resolve((request.result as RecordedVoice) || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Erreur lors de la lecture IndexedDB:', err);
    return null;
  }
}

/**
 * Enregistre ou met à jour la voix d'un auteur dans IndexedDB
 */
export async function saveRecordedVoice(voice: RecordedVoice): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(voice);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime un enregistrement vocal
 */
export async function deleteRecordedVoice(bookId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(bookId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Liste tous les enregistrements vocaux présents sur l'appareil
 */
export async function listRecordedVoices(): Promise<RecordedVoice[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve((request.result as RecordedVoice[]) || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Erreur lors du listage IndexedDB:', err);
    return [];
  }
}
