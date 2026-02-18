"use client";

import { useEffect, useState } from "react";
import { fetchAdminSiteSettings, upsertAdminSiteSettings } from "@/lib/api";

type SettingRow = { key: string; value: string };

export default function SiteSettingsPage() {
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const response = await fetchAdminSiteSettings();
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to load site settings.");
      setLoading(false);
      return;
    }
    const nextRows = (response.data?.settings ?? []).map((item) => ({ key: item.key, value: item.value }));
    setRows(nextRows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRow = (index: number, patch: Partial<SettingRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const onSaveAll = async () => {
    setSaving(true);
    setError(null);
    const payload = rows.filter((row) => row.key.trim()).map((row) => ({ key: row.key.trim(), value: row.value }));
    const response = await upsertAdminSiteSettings(payload);
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to save site settings.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Site Settings</h1>
      <p>Update global key-value settings for the dashboard.</p>
      {error && <div className="error">{error}</div>}

      <section className="panel">
        <div className="head">
          <h2>Settings</h2>
          <button type="button" className="ghost" onClick={addRow}>Add Row</button>
        </div>

        {loading ? (
          <div className="empty">Loading settings...</div>
        ) : rows.length === 0 ? (
          <div className="empty">No settings yet. Add your first row.</div>
        ) : (
          <div className="rows">
            {rows.map((row, index) => (
              <div key={`${row.key}-${index}`} className="row">
                <input
                  value={row.key}
                  onChange={(event) => updateRow(index, { key: event.target.value })}
                  placeholder="key"
                />
                <textarea
                  value={row.value}
                  onChange={(event) => updateRow(index, { value: event.target.value })}
                  placeholder="value"
                  rows={2}
                />
                <button type="button" className="danger" onClick={() => removeRow(index)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button type="button" onClick={onSaveAll} disabled={saving}>{saving ? "Saving..." : "Save All"}</button>
        </div>
      </section>

      <style jsx>{`
        h1 { margin: 0 0 6px; }
        p { margin: 0 0 20px; color: var(--text-muted); }
        .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); padding: 16px; }
        .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
        h2 { margin: 0; font-size: 18px; }
        .rows { display: grid; gap: 10px; }
        .row { display: grid; gap: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-muted); padding: 12px; }
        input, textarea { border-radius: 8px; border: 1px solid var(--border); background: #0f0f0f; color: var(--text); padding: 10px 12px; }
        .actions { margin-top: 12px; display: flex; justify-content: flex-end; }
        button { border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; background: var(--brand-soft); color: var(--text); cursor: pointer; min-height: 42px; }
        .ghost { background: transparent; }
        .danger { border-color: var(--danger); color: #ffd9de; background: var(--danger-soft); }
        .error { margin-bottom: 12px; background: var(--danger-soft); border: 1px solid var(--danger); color: #ffe3e7; border-radius: 8px; padding: 10px 12px; }
        .empty { color: var(--text-muted); }
        @media (max-width: 720px) {
          .head { flex-direction: column; align-items: stretch; }
          .actions { justify-content: stretch; }
          .actions button, .head button { width: 100%; }
        }
      `}</style>
    </main>
  );
}
