"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminStat, createAdminStat, deleteAdminStat, fetchAdminStats, updateAdminStat } from "@/lib/api";

type StatForm = {
  number: string;
  label: string;
  icon: string;
  order: string;
};

const emptyForm: StatForm = {
  number: "",
  label: "",
  icon: "",
  order: "0",
};

export default function StatsCrudPage() {
  const [items, setItems] = useState<AdminStat[]>([]);
  const [form, setForm] = useState<StatForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StatForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const response = await fetchAdminStats();
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to load stats.");
      setLoading(false);
      return;
    }
    setItems(response.data?.stats ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await createAdminStat({
      number: form.number,
      label: form.label,
      icon: form.icon,
      order: Number(form.order || 0),
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to create stat.");
      return;
    }
    setForm(emptyForm);
    await load();
  };

  const startEdit = (item: AdminStat) => {
    setEditingId(item.id);
    setEditForm({
      number: item.number,
      label: item.label,
      icon: item.icon,
      order: String(item.order),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const onSave = async (id: number) => {
    setSaving(true);
    setError(null);
    const response = await updateAdminStat(id, {
      number: editForm.number,
      label: editForm.label,
      icon: editForm.icon,
      order: Number(editForm.order || 0),
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to update stat.");
      return;
    }
    cancelEdit();
    await load();
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this stat?")) {
      return;
    }
    setSaving(true);
    setError(null);
    const response = await deleteAdminStat(id);
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to delete stat.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Stats</h1>
      <p>Manage headline statistic cards.</p>
      {error && <div className="error">{error}</div>}

      <section className="panel">
        <h2>Create Stat</h2>
        <form className="form" onSubmit={onCreate}>
          <input value={form.number} onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))} placeholder="Number" required />
          <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="Label" required />
          <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="Icon" />
          <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} placeholder="Order" />
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Stat"}</button>
        </form>
      </section>

      <section className="panel">
        <h2>All Stats</h2>
        {loading ? <div className="empty">Loading stats...</div> : (
          <div className="list">
            {items.map((item) => {
              const editing = editingId === item.id;
              return (
                <article key={item.id} className="item">
                  {editing ? (
                    <>
                      <input value={editForm.number} onChange={(e) => setEditForm((p) => ({ ...p, number: e.target.value }))} />
                      <input value={editForm.label} onChange={(e) => setEditForm((p) => ({ ...p, label: e.target.value }))} />
                      <input value={editForm.icon} onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))} />
                      <input type="number" value={editForm.order} onChange={(e) => setEditForm((p) => ({ ...p, order: e.target.value }))} />
                      <div className="actions">
                        <button type="button" onClick={() => onSave(item.id)} disabled={saving}>Save</button>
                        <button type="button" className="ghost" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <header>
                        <strong>{item.number}</strong>
                        <span className="meta">order {item.order}</span>
                      </header>
                      <div>{item.label}</div>
                      <div className="meta">icon: {item.icon || "—"}</div>
                      <div className="actions">
                        <button type="button" onClick={() => startEdit(item)}>Edit</button>
                        <button type="button" className="danger" onClick={() => onDelete(item.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        h1 { margin: 0 0 6px; }
        p { margin: 0 0 20px; color: var(--text-muted); }
        .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); padding: 16px; margin-bottom: 16px; }
        h2 { margin: 0 0 12px; font-size: 18px; }
        .form, .item { display: grid; gap: 10px; }
        .list { display: grid; gap: 12px; }
        .item { padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-muted); }
        input { border-radius: 8px; border: 1px solid var(--border); background: #0f0f0f; color: var(--text); padding: 10px 12px; }
        header { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
        .meta { color: var(--text-muted); font-size: 13px; }
        .actions { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; }
        button { border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; background: var(--brand-soft); color: var(--text); cursor: pointer; min-height: 42px; flex: 1 1 120px; }
        .ghost { background: transparent; }
        .danger { border-color: var(--danger); color: #ffd9de; background: var(--danger-soft); }
        .error { margin-bottom: 12px; background: var(--danger-soft); border: 1px solid var(--danger); color: #ffe3e7; border-radius: 8px; padding: 10px 12px; }
        .empty { color: var(--text-muted); }
        @media (max-width: 720px) { .actions { flex-direction: column; } button { width: 100%; } }
      `}</style>
    </main>
  );
}
