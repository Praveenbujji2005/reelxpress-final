import { NextResponse } from 'next/server';
import {
  saveTestimonial,
  deleteTestimonial,
  savePricingPlan,
  deletePricingPlan,
  saveFaq,
  deleteFaq,
  saveHeroSlide,
  deleteHeroSlide,
  invalidateCmsCache,
} from '@/lib/cmsServices';
import {
  getServerCmsItems,
  saveServerCmsItem,
  deleteServerCmsItem,
} from '@/lib/serverCmsStore';

const PUBLIC_CMS_TYPES = ['testimonials', 'reviews', 'pricing', 'faqs', 'hero', 'slides'];
const ALL_CMS_TYPES = [...PUBLIC_CMS_TYPES, 'activity'];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'testimonials').toLowerCase().trim();

    if (!ALL_CMS_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported CMS type "${type}". Supported types: ${ALL_CMS_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Read persistently from server-side store
    const data = getServerCmsItems(type);

    // Set cache headers: no-cache, no-store to prevent stale public content upon admin edit
    const isActivity = type === 'activity';
    const cacheHeader = isActivity
      ? 'private, no-cache, no-store, must-revalidate'
      : 'no-cache, no-store, must-revalidate';

    return NextResponse.json(
      { success: true, type, count: data.length, data },
      {
        headers: {
          'Cache-Control': cacheHeader,
        },
      }
    );
  } catch (err) {
    console.error('[API /api/cms GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch CMS content.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, item, adminEmail } = body;

    if (!type || !item) {
      return NextResponse.json(
        { success: false, error: 'Missing type or item payload.' },
        { status: 400 }
      );
    }

    const normalizedType = type.toLowerCase().trim();
    if (!PUBLIC_CMS_TYPES.includes(normalizedType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported CMS type for save: "${type}". Allowed: ${PUBLIC_CMS_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 1. Reliably persist to server-side CMS store
    const savedItem = saveServerCmsItem(normalizedType, item, adminEmail);

    // 2. Also try persisting to Firestore in background (if configured & accessible)
    try {
      switch (normalizedType) {
        case 'testimonials':
        case 'reviews':
          await saveTestimonial(item, adminEmail);
          break;
        case 'pricing':
          await savePricingPlan(item, adminEmail);
          break;
        case 'faqs':
          await saveFaq(item, adminEmail);
          break;
        case 'hero':
        case 'slides':
          await saveHeroSlide(item, adminEmail);
          break;
      }
    } catch (fbErr) {
      console.warn('[API /api/cms POST] Secondary Firestore sync notice:', fbErr?.message);
    }

    invalidateCmsCache(normalizedType);

    return NextResponse.json({
      success: true,
      type: normalizedType,
      item: savedItem,
      message: `${normalizedType} saved successfully.`,
    });
  } catch (err) {
    console.error('[API /api/cms POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save CMS item.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawType = searchParams.get('type');
    const id = searchParams.get('id');
    const adminEmail = searchParams.get('adminEmail') || 'admin@reelxpress.com';

    if (!rawType || !id) {
      return NextResponse.json(
        { success: false, error: 'Missing type or id.' },
        { status: 400 }
      );
    }

    const type = rawType.toLowerCase().trim();
    if (!PUBLIC_CMS_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported CMS type for delete: "${rawType}". Allowed: ${PUBLIC_CMS_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 1. Delete from persistent server-side store
    deleteServerCmsItem(type, id, adminEmail);

    // 2. Also attempt Firestore delete
    try {
      switch (type) {
        case 'testimonials':
        case 'reviews':
          await deleteTestimonial(id, adminEmail);
          break;
        case 'pricing':
          await deletePricingPlan(id, adminEmail);
          break;
        case 'faqs':
          await deleteFaq(id, adminEmail);
          break;
        case 'hero':
        case 'slides':
          await deleteHeroSlide(id, adminEmail);
          break;
      }
    } catch (fbErr) {
      console.warn('[API /api/cms DELETE] Secondary Firestore delete notice:', fbErr?.message);
    }

    invalidateCmsCache(type);

    return NextResponse.json({
      success: true,
      type,
      id,
      message: `${type} item ${id} deleted successfully.`,
    });
  } catch (err) {
    console.error('[API /api/cms DELETE] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete CMS item.' },
      { status: 500 }
    );
  }
}
