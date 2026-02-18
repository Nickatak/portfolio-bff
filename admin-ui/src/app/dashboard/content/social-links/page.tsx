"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminSocialLink,
  createAdminSocialLink,
  deleteAdminSocialLink,
  fetchAdminSocialLinks,
  updateAdminSocialLink,
} from "@/lib/api";

type SocialForm = { name: string; url: string; icon: string; order: string };
const emptyForm: SocialForm = { name: "", url: "", icon: "", order: "0" };

export default function SocialLinksCrudPage() {
  const [items, setItems] = useState<AdminSocialLink[]>([]);
  const [form, setForm] = useState<SocialForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SocialForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const response = await fetchAdminSocialLinks();
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to load social links.");
      setLoading(false);
      return;
    }
    setItems(response.data?.socialLinks ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await createAdminSocialLink({
      name: form.name,
      url: form.url,
      icon: form.icon,
      order: Number(form.order || 0),
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to create social link.");
      return;
    }
    setForm(emptyForm);
    await load();
  };

  const startEdit = (item: AdminSocialLink) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, url: item.url, icon: item.icon, order: String(item.order) });
  };

  const onSave = async (id: number) => {
    setSaving(true);
    setError(null);
    const response = await updateAdminSocialLink(id, {
      name: editForm.name,
      url: editForm.url,
      icon: editForm.icon,
      order: Number(editForm.order || 0),
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to update social link.");
      return;
    }
    setEditingId(null);
    setEditForm(emptyForm);
    await load();
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this social link?")) return;
    setSaving(true);
    setError(null);
    const response = await deleteAdminSocialLink(id);
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to delete social link.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Social Links</h1>
      <p>Manage outbound social profiles.</p>
      {error && <div className="error">{error}</div>}
      <section className="panel">
        <h2>Create Social Link</h2>
        <form className="form" onSubmit={onCreate}>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" required />
          <input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="URL" required />
          <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="Icon" />
          <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} placeholder="Order" />
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Link"}</button>
        </form>
      </section>
      <section className="panel">
        <h2>All Social Links</h2>
        {loading ? <div className="empty">Loading social links...</div> : (
          <div className="list">
            {items.map((item) => {
              const editing = editingId === item.id;
              return (
                <article key={item.id} className="item">
                  {editing ? (
                    <>
                      <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                      <input value={editForm.url} onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))} />
                      <input value={editForm.icon} onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))} />
                      <input type="number" value={editForm.order} onChange={(e) => setEditForm((p) => ({ ...p, order: e.target.value }))} />
                      <div className="actions">
                        <button type="button" onClick={() => onSave(item.id)} disabled={saving}>Save</button>
                        <button type="button" className="ghost" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <header><strong>{item.name}</strong><span className="meta">order {item.order}</span></header>
                      <div className="meta">{item.url}</div>
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
        .meta { color: var(--text-muted); font-size: 13px; word-break: break-word; }
        header { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
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
