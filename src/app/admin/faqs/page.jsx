'use client';

import React, { useState, useEffect } from 'react';
import { getFaqs, saveFaq, deleteFaq } from '@/lib/cmsServices';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminFaqsPage() {
  const { user } = useAdminAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (editingFaq || faqToDelete) {
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
  }, [editingFaq, faqToDelete]);

  const fetchFaqs = async () => {
    try {
      const data = await getFaqs();
      setFaqs(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateNew = () => {
    setEditingFaq({
      id: 'new_' + Date.now(),
      question: '',
      answer: '',
      category: 'General',
      enabled: true,
      order: faqs.length + 1,
    });
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const questionText = (editingFaq.question || editingFaq.q || '').trim();
    const answerText = (editingFaq.answer || editingFaq.a || '').trim();
    if (!questionText || !answerText) {
      alert('Question and answer are required.');
      return;
    }
    setIsSaving(true);
    try {
      await saveFaq(
        {
          ...editingFaq,
          question: questionText,
          answer: answerText,
          q: questionText,
          a: answerText,
        },
        user?.email
      );
      showToast('FAQ saved successfully!');
      setEditingFaq(null);
      await fetchFaqs();
    } catch (err) {
      alert('Failed to save FAQ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;
    try {
      await deleteFaq(faqToDelete.id, user?.email);
      showToast('FAQ deleted.');
      setFaqToDelete(null);
      await fetchFaqs();
    } catch (err) {
      alert('Failed to delete FAQ: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleMove = async (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= faqs.length) return;

    const copy = [...faqs];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    copy.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setFaqs(copy);
    try {
      await Promise.all(copy.map((f) => saveFaq(f, user?.email)));
      showToast('Order updated.');
    } catch {
      fetchFaqs();
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question?.toLowerCase().includes(search.toLowerCase()) ||
      f.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100050] px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-white text-sm shadow-xl flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions (FAQ) CMS
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Add, edit, reorder, and publish FAQ entries shown on the website.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-[#151215] border border-white/10">
        <input
          type="text"
          placeholder="Search FAQs by question or answer keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white text-sm focus:border-[#F28C3C] focus:outline-none"
        />
      </div>

      {/* FAQ List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-[#151215] border border-white/5 p-4 flex items-center justify-between ambient-skeleton min-h-[64px]"
            >
              <div className="space-y-2 flex-1">
                <div className="w-2/3 h-4 rounded bg-white/10 ambient-pulse" />
                <div className="w-1/3 h-3 rounded bg-white/5 ambient-pulse" />
              </div>
              <div className="w-20 h-8 rounded-lg bg-white/10 shrink-0 ambient-pulse" />
            </div>
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="py-20 text-center text-text-muted border border-dashed border-white/10 rounded-3xl">
          No FAQs found matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {(filteredFaqs ?? []).map((faq, idx) => (
            <div
              key={faq.id ?? `admin-faq-${idx}`}
              className={`rounded-2xl p-5 bg-[#151215] border transition-all ${
                faq.enabled ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F28C3C]/20 text-[#F28C3C]">
                      #{idx + 1} · {faq.category || 'General'}
                    </span>
                    {!faq.enabled && (
                      <span className="text-[10px] font-bold text-text-muted">HIDDEN</span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-base leading-snug">
                    {faq.question || faq.q}
                  </h3>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    {faq.answer || faq.a}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                  <button
                    disabled={idx === faqs.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                  <button
                    onClick={() => setEditingFaq(faq)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer ml-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setFaqToDelete(faq)}
                    className="p-2 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create FAQ Modal */}
      {editingFaq && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100040] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl bg-[#161318] border border-white/15 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setEditingFaq(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6">
              {editingFaq.id.startsWith('new_') ? 'Add New FAQ' : 'Edit FAQ Entry'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Category Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Booking & Delivery, Technical"
                  value={editingFaq.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Question*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How quickly are reels delivered?"
                  value={editingFaq.question ?? editingFaq.q ?? ''}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      question: e.target.value,
                      q: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Answer Text*
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clear, concise explanation..."
                  value={editingFaq.answer ?? editingFaq.a ?? ''}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      answer: e.target.value,
                      a: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="faq-en"
                  checked={editingFaq.enabled}
                  onChange={(e) => setEditingFaq({ ...editingFaq, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F28C3C] accent-[#F28C3C] bg-[#0c0a0c]"
                />
                <label htmlFor="faq-en" className="text-sm font-semibold text-white">
                  Publish to live website FAQ accordion
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm cursor-pointer"
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
                  <span>{isSaving ? 'Saving FAQ...' : 'Save FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {faqToDelete && (
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
            <h3 className="text-xl font-extrabold text-white mb-2">Delete FAQ?</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-white">&quot;{faqToDelete.question}&quot;</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
