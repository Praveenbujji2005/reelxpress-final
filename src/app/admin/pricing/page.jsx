'use client';

import React, { useState, useEffect } from 'react';
import {
  getPricingPlans,
  savePricingPlan,
  deletePricingPlan,
} from '@/lib/cmsServices';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminPricingPage() {
  const { user } = useAdminAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (editingPlan || planToDelete) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        if (typeof window !== 'undefined' && window.lenis && typeof window.lenis.start === 'function') {
          window.lenis.start();
        }
      };
    }
  }, [editingPlan, planToDelete]);

  // Temporary feature text for adding to inclusions
  const [newFeatureText, setNewFeatureText] = useState('');

  const fetchPlans = async () => {
    try {
      const data = await getPricingPlans();
      setPlans(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateNew = () => {
    setEditingPlan({
      id: 'new_' + Date.now(),
      category: activeTab === 'all' ? 'instant' : activeTab,
      tag: 'NEW PACKAGE',
      name: '',
      description: '',
      price: '₹ ',
      priceSuffix: '+ GST',
      badge: '',
      isPopular: false,
      enabled: true,
      order: plans.length + 1,
      shootType: '',
      inclusions: [
        'Professional Shoot on Latest iPhone',
        'High-Quality Edited Reel',
        'Instant On-site Cloud Delivery',
      ],
      ctaText: 'Book Now',
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setEditingPlan((prev) => ({
      ...prev,
      inclusions: [...(prev.inclusions || []), newFeatureText.trim()],
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx) => {
    setEditingPlan((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingPlan?.name?.trim() || !editingPlan?.price?.trim()) {
      alert('Plan name and price are required.');
      return;
    }
    setIsSaving(true);
    try {
      await savePricingPlan(editingPlan, user?.email);
      showToast('Pricing plan saved successfully!');
      setEditingPlan(null);
      await fetchPlans();
    } catch (err) {
      alert('Failed to save plan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePricingPlan(planToDelete.id, user?.email);
      showToast('Plan deleted.');
      setPlanToDelete(null);
      await fetchPlans();
    } catch (err) {
      alert('Failed to delete plan: ' + (err?.message || 'Unknown error'));
    }
  };

  const filteredPlans =
    activeTab === 'all'
      ? plans
      : plans.filter((p) => (p.category || 'instant') === activeTab);

  return (
    <div className="space-y-6 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100050] px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-white text-sm shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pricing Plans &amp; Packages Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Configure rates, bullet inclusions, categories, and best-seller badges.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add Pricing Plan</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#151215] border border-white/10 w-fit">
        {[
          { id: 'all', label: 'All Packages' },
          { id: 'instant', label: 'Instant Packages' },
          { id: 'business', label: 'Business Packages' },
          { id: 'wedding', label: 'Wedding & Luxe' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white shadow-md'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-[#151215] border border-white/5 p-6 flex flex-col justify-between shadow-xl ambient-skeleton min-h-[360px]"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="w-20 h-3 rounded-full bg-white/10 ambient-pulse" />
                  <div className="w-16 h-4 rounded-full bg-white/10 ambient-pulse" />
                </div>
                <div className="w-40 h-6 rounded-lg bg-white/10 mb-2 ambient-pulse" />
                <div className="w-full h-3 rounded bg-white/5 mb-4 ambient-pulse" />
                <div className="my-4 pb-4 border-b border-white/5 flex gap-2 items-baseline">
                  <div className="w-24 h-7 rounded bg-white/15 ambient-pulse" />
                  <div className="w-12 h-3 rounded bg-white/5 ambient-pulse" />
                </div>
                <div className="space-y-2 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-white/10 shrink-0 ambient-pulse" />
                      <div className="w-48 h-3 rounded bg-white/5 ambient-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between">
                <div className="w-20 h-4 rounded bg-white/10 ambient-pulse" />
                <div className="w-16 h-8 rounded-xl bg-white/10 ambient-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-20 text-center text-text-muted border border-dashed border-white/10 rounded-3xl">
          No pricing plans found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredPlans ?? []).map((plan, idx) => (
            <div
              key={plan.id ?? `admin-plan-${idx}`}
              className={`rounded-3xl bg-[#151215] border p-6 flex flex-col justify-between shadow-xl transition-all ${
                plan.isPopular
                  ? 'border-[#F28C3C] shadow-[0_0_25px_rgba(242,140,60,0.25)]'
                  : 'border-white/10'
              }`}
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F28C3C]">
                    {plan.tag || plan.category}
                  </span>
                  {plan.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-4 pb-4 border-b border-white/10">
                  <span className="text-2xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-text-muted ml-1.5">{plan.priceSuffix}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  {(plan.inclusions || []).slice(0, 5).map((inc, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                      <span className="material-symbols-outlined text-[15px] text-[#F28C3C] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span className="truncate">{inc}</span>
                    </div>
                  ))}
                  {(plan.inclusions || []).length > 5 && (
                    <p className="text-[11px] text-text-muted">
                      + {(plan.inclusions || []).length - 5} more inclusions
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    plan.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'
                  }`}
                >
                  {plan.enabled ? 'Active' : 'Disabled'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Edit Plan"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-400 cursor-pointer"
                    title="Delete Plan"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          EDIT / CREATE PLAN MODAL
         ========================================================================= */}
      {editingPlan && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100040] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-[#161318] border border-white/15 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setEditingPlan(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6">
              {editingPlan.id.startsWith('new_') ? 'Add New Pricing Plan' : 'Edit Pricing Plan'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Plan Category*
                  </label>
                  <select
                    value={editingPlan.category}
                    onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="instant">Instant Packages</option>
                    <option value="business">Business Packages</option>
                    <option value="wedding">Wedding &amp; Luxe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Header Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SINGLE EVENT, COMPREHENSIVE"
                    value={editingPlan.tag}
                    onChange={(e) => setEditingPlan({ ...editingPlan, tag: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Plan Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hourly Plan"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Price Value*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹ 2,200 or Customised"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of who this plan is ideal for..."
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Inclusions Builder */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Package Inclusions / Features
                </label>
                <div className="space-y-2 mb-3">
                  {(editingPlan.inclusions || []).map((inc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0c0a0c] border border-white/10 text-xs text-white"
                    >
                      <span className="flex-1 truncate">{inc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new feature inclusion..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0c0a0c] border border-white/15 text-xs text-white focus:border-[#F28C3C] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="plan-pop"
                    checked={editingPlan.isPopular}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F28C3C] accent-[#F28C3C] bg-[#0c0a0c]"
                  />
                  <label htmlFor="plan-pop" className="text-xs font-semibold text-white">
                    Mark as Popular / Recommended
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="plan-en"
                    checked={editingPlan.enabled}
                    onChange={(e) => setEditingPlan({ ...editingPlan, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#F28C3C] accent-[#F28C3C] bg-[#0c0a0c]"
                  />
                  <label htmlFor="plan-en" className="text-xs font-semibold text-white">
                    Active / Published
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                  <span>{isSaving ? 'Saving Changes...' : 'Save Pricing Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {planToDelete && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#181318] border border-red-500/30 p-6 sm:p-7 shadow-2xl text-center"
          >
            <h3 className="text-xl font-extrabold text-white mb-2">Delete Pricing Plan?</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-white">&quot;{planToDelete.name}&quot;</strong>? This tier will be removed from the pricing section.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
