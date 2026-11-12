import { db, isFirebaseConfigured, firebaseConfig } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

export const ENQUIRIES_COLLECTION = 'enquiries';

/**
 * Validates enquiry input data
 */
export function validateEnquiryData(data) {
  const errors = [];
  const customerName = (data.customerName || data.fullName || data.name || '').trim();
  const email = (data.email || '').trim();
  const phone = (data.phone || '').trim();
  const selectedService = (data.selectedService || data.serviceType || data.type || data.subject || '').trim();

  if (!customerName || customerName.length < 2) {
    errors.push('Customer name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (!phone || digitsOnly.length < 10) {
    errors.push('Please enter a valid 10-digit phone number.');
  }

  if (!selectedService) {
    errors.push('Please select a service or shoot type.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes an enquiry document from Firestore (handling timestamps and fallbacks)
 */
export function normalizeEnquiry(id, raw = {}) {
  const customerName = raw.customerName || raw.fullName || raw.name || 'Anonymous Client';
  const email = raw.email || 'No email provided';
  const phone = raw.phone || 'No phone provided';
  const companyName = raw.companyName || raw.company || '';
  const selectedService = raw.selectedService || raw.serviceType || raw.type || 'General Shoot';
  const enquiryMessage = raw.enquiryMessage || raw.message || raw.notes || 'No message provided.';
  const city = raw.city || 'Bengaluru';
  const eventDate = raw.eventDate || raw.date || '';
  const status = raw.status || 'New';
  const sourcePage = raw.sourcePage || raw.source || 'Website Booking Form';
  const createdAt = raw.createdAt || new Date().toISOString();

  // Safe parsing of Firestore Timestamps
  let timestampDate = null;
  if (raw.timestamp?.toDate && typeof raw.timestamp.toDate === 'function') {
    timestampDate = raw.timestamp.toDate();
  } else if (raw.timestamp instanceof Date) {
    timestampDate = raw.timestamp;
  } else if (raw.timestamp && typeof raw.timestamp === 'object' && raw.timestamp.seconds) {
    timestampDate = new Date(raw.timestamp.seconds * 1000);
  } else if (typeof raw.timestamp === 'string' || typeof raw.timestamp === 'number') {
    timestampDate = new Date(raw.timestamp);
  } else {
    timestampDate = new Date(createdAt);
  }

  const formattedDate = timestampDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = timestampDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id,
    customerName,
    fullName: customerName,
    email,
    phone,
    companyName,
    selectedService,
    serviceType: selectedService,
    enquiryMessage,
    message: enquiryMessage,
    city,
    eventDate,
    status,
    sourcePage,
    source: sourcePage,
    createdAt,
    timestamp: raw.timestamp || null,
    timestampDate,
    formattedDate,
    formattedTime,
  };
}

/**
 * Helper to convert plain object to Firestore REST API payload
 */
export function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      fields[key] = Number.isInteger(val)
        ? { integerValue: String(val) }
        : { doubleValue: val };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((v) => ({ stringValue: String(v) })),
        },
      };
    }
  }
  return { fields };
}

/**
 * Helper to parse Firestore REST API document to plain object
 */
export function parseFirestoreDoc(doc) {
  if (!doc) return null;
  const fields = doc.fields || {};
  const data = { id: doc.name?.split('/').pop() || '' };
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) data[key] = val.stringValue;
    else if ('integerValue' in val) data[key] = Number(val.integerValue);
    else if ('doubleValue' in val) data[key] = Number(val.doubleValue);
    else if ('booleanValue' in val) data[key] = val.booleanValue;
    else if ('timestampValue' in val) data[key] = val.timestampValue;
    else if ('arrayValue' in val) {
      data[key] = (val.arrayValue?.values || []).map((v) => v.stringValue || v);
    }
  }
  return normalizeEnquiry(data.id, data);
}

/**
 * Timeout helper for Firestore operations
 */
function withTimeout(promise, ms = 4000, label = 'Firestore operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Submit an enquiry directly to Firebase Firestore
 * Throws a clear error if Firestore fails (never returns fake success)
 */
export async function createEnquiry(enquiryData) {
  const validation = validateEnquiryData(enquiryData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  const customerName = (enquiryData.customerName || enquiryData.fullName || enquiryData.name || '').trim();
  const email = (enquiryData.email || '').trim().toLowerCase();
  const phone = (enquiryData.phone || '').trim();
  const companyName = (enquiryData.companyName || enquiryData.company || '').trim();
  const selectedService = (enquiryData.selectedService || enquiryData.serviceType || enquiryData.type || 'General Shoot').trim();
  const enquiryMessage = (enquiryData.enquiryMessage || enquiryData.message || enquiryData.notes || '').trim() || 'No message provided.';
  const city = (enquiryData.city || 'Bengaluru').trim();
  const eventDate = enquiryData.eventDate || enquiryData.date || '';
  const sourcePage = enquiryData.sourcePage || enquiryData.source || 'Booking Section';
  const createdAt = new Date().toISOString();

  const docPayload = {
    customerName,
    fullName: customerName,
    email,
    phone,
    companyName: companyName || '',
    selectedService,
    serviceType: selectedService,
    enquiryMessage,
    message: enquiryMessage,
    city,
    eventDate,
    status: 'New', // Standardized: 'New' | 'Contacted' | 'Completed'
    sourcePage,
    source: sourcePage,
    createdAt,
  };

  let savedDocId = null;
  let lastError = null;

  // 1. Direct Firestore REST API (Fastest and highly reliable on Server / Node.js)
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig?.apiKey;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig?.projectId;

  if (apiKey && projectId) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${ENQUIRIES_COLLECTION}?key=${apiKey}`;
      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreFields(docPayload)),
      });

      if (restRes.ok) {
        const docData = await restRes.json();
        savedDocId = docData.name?.split('/').pop();
        console.log(`[Firestore] Successfully created enquiry document via REST API: ${savedDocId}`);
      } else {
        const errJson = await restRes.json().catch(() => ({}));
        const status = restRes.status;
        const msg = errJson?.error?.message || '';

        if (status === 404 && msg.includes('database (default) does not exist')) {
          throw new Error(
            `Cloud Firestore database is not created yet in project "${projectId}". Please visit https://console.firebase.google.com/project/${projectId}/firestore and click "Create database".`
          );
        } else if (status === 403) {
          throw new Error(
            `Firestore permission denied. Please verify that your Firestore Security Rules permit creating documents in "${ENQUIRIES_COLLECTION}".`
          );
        } else {
          lastError = new Error(`Firestore REST Error (${status}): ${msg}`);
        }
      }
    } catch (restErr) {
      if (restErr.message?.includes('not created yet') || restErr.message?.includes('permission denied')) {
        throw restErr;
      }
      lastError = restErr;
    }
  }

  // 2. Firebase Client SDK (If REST didn't succeed or when called in browser)
  if (!savedDocId && db) {
    try {
      const docRef = await withTimeout(
        addDoc(collection(db, ENQUIRIES_COLLECTION), {
          ...docPayload,
          timestamp: serverTimestamp(),
        }),
        4500,
        'Firestore addDoc'
      );
      savedDocId = docRef.id;
      console.log(`[Firestore] Successfully created enquiry document via Client SDK: ${savedDocId}`);
    } catch (sdkErr) {
      console.error('[Firestore] Client SDK write error:', sdkErr);
      if (sdkErr.code === 'not-found' || sdkErr.message?.includes('NOT_FOUND')) {
        throw new Error(
          `Cloud Firestore database is not created yet in project "${projectId}". Please visit https://console.firebase.google.com/project/${projectId}/firestore and click "Create database".`
        );
      } else if (sdkErr.code === 'permission-denied') {
        throw new Error(
          `Firestore permission denied. Please update security rules in Firebase Console to allow write to "${ENQUIRIES_COLLECTION}".`
        );
      }
      lastError = sdkErr;
    }
  }

  if (!savedDocId) {
    throw (
      lastError ||
      new Error('Failed to save enquiry to Firebase Firestore. Please check your Firestore connection and permissions.')
    );
  }

  return {
    id: savedDocId,
    ...docPayload,
  };
}

/**
 * Real-time listener for enquiries collection using Firestore onSnapshot
 */
export function subscribeToEnquiries({ onData, onError }) {
  if (!isFirebaseConfigured || !db) {
    onError?.(new Error('Firebase is not configured. Please check environment variables in .env.local.'));
    return () => {};
  }

  try {
    const colRef = collection(db, ENQUIRIES_COLLECTION);
    let q;
    try {
      q = query(colRef, orderBy('createdAt', 'desc'));
    } catch {
      q = colRef;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => normalizeEnquiry(docSnap.id, docSnap.data()));
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(items);
      },
      (err) => {
        console.warn('[Firestore] onSnapshot error:', err);
        // If ordered query requires an index that is building, fallback to raw collection
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          return onSnapshot(
            colRef,
            (fallbackSnap) => {
              const fallbackItems = fallbackSnap.docs.map((d) => normalizeEnquiry(d.id, d.data()));
              fallbackItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              onData(fallbackItems);
            },
            (fallbackErr) => onError?.(fallbackErr)
          );
        }
        onError?.(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    onError?.(err);
    return () => {};
  }
}

/**
 * Fetch all enquiries once from Firestore
 */
export async function getEnquiriesFromFirestore({ search = '', status = 'all', sortBy = 'newest' } = {}) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig?.apiKey;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig?.projectId;

  let list = [];

  // A. Try REST API first (Server-safe)
  if (apiKey && projectId) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${ENQUIRIES_COLLECTION}?key=${apiKey}`;
      const res = await fetch(restUrl, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.documents)) {
          list = json.documents.map(parseFirestoreDoc).filter(Boolean);
        }
      }
    } catch {}
  }

  // B. Client SDK if REST returned empty
  if (list.length === 0 && db) {
    try {
      const colRef = collection(db, ENQUIRIES_COLLECTION);
      const snapshot = await withTimeout(getDocs(colRef), 4000, 'getDocs enquiries');
      list = snapshot.docs.map((docSnap) => normalizeEnquiry(docSnap.id, docSnap.data()));
    } catch (err) {
      console.warn('[Firestore] getDocs notice:', err?.message);
    }
  }

  // Filter by search term
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.customerName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.toLowerCase().includes(term) ||
        item.companyName?.toLowerCase().includes(term) ||
        item.selectedService?.toLowerCase().includes(term) ||
        item.enquiryMessage?.toLowerCase().includes(term)
    );
  }

  // Filter by status
  if (status && status !== 'all') {
    const targetStatus = status.toLowerCase();
    list = list.filter((item) => (item.status || '').toLowerCase() === targetStatus);
  }

  // Sort
  list.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  return list;
}

/**
 * Update enquiry status in Firestore ('New' | 'Contacted' | 'Completed')
 */
export async function updateEnquiryStatusInFirestore(id, newStatus, adminEmail = 'admin@reelxpress.com') {
  // Normalize capitalized status
  const normalizedStatus =
    newStatus.toLowerCase() === 'completed' || newStatus.toLowerCase() === 'resolved'
      ? 'Completed'
      : newStatus.toLowerCase() === 'contacted'
      ? 'Contacted'
      : 'New';

  const updatedAt = new Date().toISOString();

  // A. REST API update
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig?.apiKey;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig?.projectId;

  if (apiKey && projectId) {
    try {
      const updateFields = {
        status: { stringValue: normalizedStatus },
        updatedAt: { stringValue: updatedAt },
        updatedBy: { stringValue: adminEmail },
      };
      const mask = 'updateMask.fieldPaths=status&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=updatedBy';
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${ENQUIRIES_COLLECTION}/${id}?${mask}&key=${apiKey}`;

      const res = await fetch(restUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: updateFields }),
      });

      if (res.ok) {
        return { success: true, id, status: normalizedStatus };
      }
    } catch {}
  }

  // B. Client SDK update
  if (db) {
    const docRef = doc(db, ENQUIRIES_COLLECTION, id);
    await updateDoc(docRef, {
      status: normalizedStatus,
      updatedAt,
      updatedBy: adminEmail,
    });
    return { success: true, id, status: normalizedStatus };
  }

  throw new Error('Could not update status: Firestore database is not accessible.');
}

/**
 * Delete enquiry from Firestore
 */
export async function deleteEnquiryFromFirestore(id) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig?.apiKey;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig?.projectId;

  // A. REST API delete
  if (apiKey && projectId) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${ENQUIRIES_COLLECTION}/${id}?key=${apiKey}`;
      const res = await fetch(restUrl, { method: 'DELETE' });
      if (res.ok) {
        return { success: true, id };
      }
    } catch {}
  }

  // B. Client SDK delete
  if (db) {
    const docRef = doc(db, ENQUIRIES_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true, id };
  }

  throw new Error('Could not delete enquiry: Firestore database is not accessible.');
}

// Backward compatibility aliases
export const createInquiry = createEnquiry;
export const getInquiries = getEnquiriesFromFirestore;
export const updateInquiryStatus = updateEnquiryStatusInFirestore;
export const deleteInquiry = deleteEnquiryFromFirestore;
