'use client';

import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '@/lib/cmsServices';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs()
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Activity &amp; Audit Log
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Tamper-proof chronological trail of all website modifications, inquiries, and publishes.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-[#151215] border border-white/10 p-6 shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-text-muted">Loading activity history...</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-text-muted">No activity recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {(logs ?? []).map((log, idx) => (
              <div
                key={log.id ?? `log-${idx}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-[#0c0a0c] border border-white/10 text-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F28C3C]/20 text-[#F28C3C] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base">history</span>
                  </div>
                  <div>
                    <div className="font-extrabold text-white">{log.action}</div>
                    <div className="text-xs text-text-muted mt-0.5">{log.details}</div>
                    <div className="text-[11px] text-white/40 mt-1">
                      By <span className="text-white/70">{log.adminEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-text-muted shrink-0 text-right">
                  {new Date(log.timestamp || Date.now()).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
