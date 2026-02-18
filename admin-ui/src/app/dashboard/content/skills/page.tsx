"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminSkill, createAdminSkill, deleteAdminSkill, fetchAdminSkills, updateAdminSkill } from "@/lib/api";

type SkillForm = { name: string; order: string };
const emptyForm: SkillForm = { name: "", order: "0" };

export default function SkillsCrudPage() {
  const [items, setItems] = useState<AdminSkill[]>([]);
  const [form, setForm] = useState<SkillForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<SkillForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const response = await fetchAdminSkills();
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to load skills.");
      setLoading(false);
      return;
    }
    setItems(response.data?.skills ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await createAdminSkill({ name: form.name, order: Number(form.order || 0) });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to create skill.");
      return;
    }
    setForm(emptyForm);
    await load();
  };

  const startEdit = (item: AdminSkill) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, order: String(item.order) });
  };

  const onSave = async (id: number) => {
    setSaving(true);
    setError(null);
    const response = await updateAdminSkill(id, { name: editForm.name, order: Number(editForm.order || 0) });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to update skill.");
      return;
    }
    setEditingId(null);
    setEditForm(emptyForm);
    await load();
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this skill?")) return;
    setSaving(true);
    setError(null);
    const response = await deleteAdminSkill(id);
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to delete skill.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Skills</h1>
      <p>CRUD editor for skills.</p>
      {error && <div className="error">{error}</div>}
      <section className="panel">
        <h2>Create Skill</h2>
        <form className="form" onSubmit={onCreate}>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Skill name" required />
          <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} placeholder="Order" />
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Skill"}</button>
        </form>
      </section>
      <section className="panel">
        <h2>All Skills</h2>
        {loading ? <div className="empty">Loading skills...</div> : (
          <div className="list">
            {items.map((item) => {
              const editing = editingId === item.id;
              return (
                <article key={item.id} className="item">
                  {editing ? (
                    <>
                      <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                      <input type="number" value={editForm.order} onChange={(e) => setEditForm((p) => ({ ...p, order: e.target.value }))} />
                      <div className="actions">
                        <button type="button" onClick={() => onSave(item.id)} disabled={saving}>Save</button>
                        <button type="button" className="ghost" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <header><strong>{item.name}</strong><span className="meta">order {item.order}</span></header>
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
        .meta { color: var(--text-muted); font-size: 13px; }
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
