"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminPage,
  createAdminPage,
  deleteAdminPage,
  fetchAdminPages,
  updateAdminPage,
} from "@/lib/api";

type PageFormState = {
  title: string;
  slug: string;
  body: string;
  isPublished: boolean;
};

const emptyPageForm: PageFormState = {
  title: "",
  slug: "",
  body: "",
  isPublished: true,
};

export default function PagesCrudPage() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [createForm, setCreateForm] = useState<PageFormState>(emptyPageForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PageFormState>(emptyPageForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPages = async () => {
    setError(null);
    const response = await fetchAdminPages();
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to load pages.");
      setLoading(false);
      return;
    }
    setPages(response.data?.pages ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await createAdminPage({
      title: createForm.title,
      slug: createForm.slug || undefined,
      body: createForm.body,
      isPublished: createForm.isPublished,
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to create page.");
      return;
    }
    setCreateForm(emptyPageForm);
    await loadPages();
  };

  const startEdit = (page: AdminPage) => {
    setEditingId(page.id);
    setEditForm({
      title: page.title,
      slug: page.slug,
      body: page.body,
      isPublished: page.isPublished,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyPageForm);
  };

  const handleSave = async (pageId: number) => {
    setSaving(true);
    setError(null);
    const response = await updateAdminPage(pageId, {
      title: editForm.title,
      slug: editForm.slug || undefined,
      body: editForm.body,
      isPublished: editForm.isPublished,
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to update page.");
      return;
    }
    cancelEdit();
    await loadPages();
  };

  const handleDelete = async (pageId: number) => {
    if (!window.confirm("Delete this page?")) {
      return;
    }
    setSaving(true);
    setError(null);
    const response = await deleteAdminPage(pageId);
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to delete page.");
      return;
    }
    await loadPages();
  };

  return (
    <main>
      <h1>Pages</h1>
      <p>Create, edit, and publish static dashboard pages.</p>
      {error && <div className="error">{error}</div>}

      <section className="panel">
        <h2>Create Page</h2>
        <form
          className="form"
          onSubmit={handleCreate}
        >
          <input
            value={createForm.title}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Title"
            required
          />
          <input
            value={createForm.slug}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, slug: event.target.value }))}
            placeholder="slug-optional"
          />
          <textarea
            value={createForm.body}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, body: event.target.value }))}
            placeholder="Body"
            rows={5}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={createForm.isPublished}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, isPublished: event.target.checked }))
              }
            />
            Published
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Page"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>All Pages</h2>
        {loading ? (
          <div className="empty">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="empty">No pages yet.</div>
        ) : (
          <div className="list">
            {pages.map((page) => {
              const isEditing = editingId === page.id;
              return (
                <article key={page.id} className="item">
                  {isEditing ? (
                    <>
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="Title"
                      />
                      <input
                        value={editForm.slug}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, slug: event.target.value }))
                        }
                        placeholder="Slug"
                      />
                      <textarea
                        value={editForm.body}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, body: event.target.value }))
                        }
                        rows={5}
                      />
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={editForm.isPublished}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, isPublished: event.target.checked }))
                          }
                        />
                        Published
                      </label>
                      <div className="actions">
                        <button type="button" onClick={() => handleSave(page.id)} disabled={saving}>
                          Save
                        </button>
                        <button type="button" className="ghost" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <header>
                        <strong>{page.title}</strong>
                        <span className={page.isPublished ? "pill on" : "pill"}>
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </header>
                      <div className="meta">/{page.slug}</div>
                      <p>{page.body || "No body content."}</p>
                      <div className="actions">
                        <button type="button" onClick={() => startEdit(page)}>
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => handleDelete(page.id)}>
                          Delete
                        </button>
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
        h1 {
          margin: 0 0 6px;
        }
        p {
          margin: 0 0 20px;
          color: var(--text-muted);
        }
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 16px;
          margin-bottom: 16px;
        }
        h2 {
          margin: 0 0 12px;
          font-size: 18px;
        }
        .form,
        .item {
          display: grid;
          gap: 10px;
        }
        .list {
          display: grid;
          gap: 12px;
        }
        .item {
          padding: 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface-muted);
        }
        input,
        textarea {
          border-radius: 8px;
          border: 1px solid var(--border);
          background: #0f0f0f;
          color: var(--text);
          padding: 10px 12px;
        }
        .check {
          display: flex;
          gap: 8px;
          align-items: center;
          color: var(--text-muted);
        }
        .meta {
          color: var(--text-muted);
          font-size: 13px;
        }
        header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }
        button {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          background: var(--brand-soft);
          color: var(--text);
          cursor: pointer;
          min-height: 42px;
          flex: 1 1 120px;
        }
        .ghost {
          background: transparent;
        }
        .danger {
          border-color: var(--danger);
          color: #ffd9de;
          background: var(--danger-soft);
        }
        .pill {
          border-radius: 999px;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 2px 8px;
          font-size: 12px;
        }
        .pill.on {
          border-color: var(--brand-soft-border);
          color: var(--text);
          background: var(--brand-soft);
        }
        .error {
          margin-bottom: 12px;
          background: var(--danger-soft);
          border: 1px solid var(--danger);
          color: #ffe3e7;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .empty {
          color: var(--text-muted);
        }
        @media (max-width: 720px) {
          header {
            flex-direction: column;
            align-items: flex-start;
          }
          .actions {
            flex-direction: column;
          }
          button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
