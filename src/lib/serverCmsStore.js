import fs from 'fs';
import path from 'path';
import { INITIAL_TESTIMONIALS, INITIAL_PRICING_PLANS } from './cmsServices';
import { REEL_PORTFOLIO, FAQ_DATA } from './data';

const CMS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'cms_store.json');

function normalizeType(type) {
  const t = (type || '').toLowerCase().trim();
  if (t === 'reviews') return 'testimonials';
  if (t === 'slides') return 'hero';
  return t;
}

function getDefaultStore() {
  return {
    testimonials: INITIAL_TESTIMONIALS,
    pricing: INITIAL_PRICING_PLANS,
    hero: REEL_PORTFOLIO,
    faqs: FAQ_DATA,
    activity: [
      {
        id: 'act_init',
        action: 'System Initialized',
        details: 'reelXpress CMS Server Store initialized successfully.',
        adminEmail: 'admin@reelxpress.com',
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function readServerStore() {
  try {
    if (fs.existsSync(CMS_FILE_PATH)) {
      const raw = fs.readFileSync(CMS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : INITIAL_TESTIMONIALS,
        pricing: Array.isArray(parsed.pricing) ? parsed.pricing : INITIAL_PRICING_PLANS,
        hero: Array.isArray(parsed.hero) ? parsed.hero : REEL_PORTFOLIO,
        faqs: Array.isArray(parsed.faqs) ? parsed.faqs : FAQ_DATA,
        activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      };
    }
  } catch (err) {
    console.warn('[readServerStore] Error reading file, using defaults:', err?.message);
  }
  const defaults = getDefaultStore();
  writeServerStore(defaults);
  return defaults;
}

export function writeServerStore(data) {
  try {
    const dir = path.dirname(CMS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[writeServerStore] Error writing file:', err?.message);
    return false;
  }
}

export function getServerCmsItems(rawType) {
  const type = normalizeType(rawType);
  const store = readServerStore();
  const list = Array.isArray(store[type]) ? store[type] : [];

  // Filter out soft-deleted items
  const active = list.filter((item) => !item._deleted);

  if (type === 'activity') {
    return [...active].sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  return [...active].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}

export function saveServerCmsItem(rawType, item, adminEmail) {
  const type = normalizeType(rawType);
  const store = readServerStore();
  const list = Array.isArray(store[type]) ? [...store[type]] : [];

  const isNew = !item.id || String(item.id).startsWith('new_');
  const itemId = isNew ? `${type.slice(0, 4)}_${Date.now()}` : String(item.id);

  const payload = {
    ...item,
    id: itemId,
    _deleted: false,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail || 'admin@reelxpress.com',
  };

  const existingIdx = list.findIndex((existing) => String(existing.id) === itemId);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...payload };
  } else {
    list.push(payload);
  }

  // Record audit activity log
  const activityList = Array.isArray(store.activity) ? [...store.activity] : [];
  activityList.unshift({
    id: `act_${Date.now()}`,
    action: isNew ? `Created ${type} item` : `Updated ${type} item`,
    details: item.title || item.name || item.question || `ID: ${itemId}`,
    adminEmail: adminEmail || 'admin@reelxpress.com',
    timestamp: new Date().toISOString(),
  });

  store[type] = list;
  store.activity = activityList.slice(0, 100);

  writeServerStore(store);
  return payload;
}

export function deleteServerCmsItem(rawType, id, adminEmail) {
  const type = normalizeType(rawType);
  const store = readServerStore();
  const list = Array.isArray(store[type]) ? [...store[type]] : [];

  const targetId = String(id);
  const updatedList = list.map((item) => {
    if (String(item.id) === targetId) {
      return { ...item, _deleted: true, updatedAt: new Date().toISOString() };
    }
    return item;
  });

  const activityList = Array.isArray(store.activity) ? [...store.activity] : [];
  activityList.unshift({
    id: `act_${Date.now()}`,
    action: `Deleted ${type} item`,
    details: `Item ID: ${targetId}`,
    adminEmail: adminEmail || 'admin@reelxpress.com',
    timestamp: new Date().toISOString(),
  });

  store[type] = updatedList;
  store.activity = activityList.slice(0, 100);

  writeServerStore(store);
  return { success: true, id: targetId };
}
