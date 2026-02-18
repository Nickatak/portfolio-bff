"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminProject,
  createAdminProject,
  deleteAdminProject,
  fetchAdminProjects,
  updateAdminProject,
} from "@/lib/api";

type ProjectFormState = {
  title: string;
  slug: string;
  description: string;
  tagsCsv: string;
  link: string;
  github: string;
  order: string;
  isPublished: boolean;
};

const emptyProjectForm: ProjectFormState = {
  title: "",
  slug: "",
  description: "",
  tagsCsv: "",
  link: "",
  github: "",
  order: "0",
  isPublished: true,
};

function parseTags(tagsCsv: string): string[] {
  return tagsCsv
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function ProjectsCrudPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [createForm, setCreateForm] = useState<ProjectFormState>(emptyProjectForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProjectFormState>(emptyProjectForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setError(null);
    const response = await fetchAdminProjects();
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to load projects.");
      setLoading(false);
      return;
    }
    setProjects(response.data?.projects ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await createAdminProject({
      title: createForm.title,
      slug: createForm.slug || undefined,
      description: createForm.description,
      tags: parseTags(createForm.tagsCsv),
      link: createForm.link,
      github: createForm.github,
      order: Number(createForm.order || 0),
      isPublished: createForm.isPublished,
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to create project.");
      return;
    }
    setCreateForm(emptyProjectForm);
    await loadProjects();
  };

  const startEdit = (project: AdminProject) => {
    setEditingId(project.id);
    setEditForm({
      title: project.title,
      slug: project.slug,
      description: project.description,
      tagsCsv: project.tags.join(", "),
      link: project.link,
      github: project.github,
      order: String(project.order),
      isPublished: project.isPublished,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyProjectForm);
  };

  const handleSave = async (projectId: number) => {
    setSaving(true);
    setError(null);
    const response = await updateAdminProject(projectId, {
      title: editForm.title,
      slug: editForm.slug || undefined,
      description: editForm.description,
      tags: parseTags(editForm.tagsCsv),
      link: editForm.link,
      github: editForm.github,
      order: Number(editForm.order || 0),
      isPublished: editForm.isPublished,
    });
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to update project.");
      return;
    }
    cancelEdit();
    await loadProjects();
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm("Delete this project?")) {
      return;
    }
    setSaving(true);
    setError(null);
    const response = await deleteAdminProject(projectId);
    setSaving(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Failed to delete project.");
      return;
    }
    await loadProjects();
  };

  return (
    <main>
      <h1>Projects</h1>
      <p>CRUD editor for project cards shown in your personal dashboard.</p>
      {error && <div className="error">{error}</div>}

      <section className="panel">
        <h2>Create Project</h2>
        <form className="form" onSubmit={handleCreate}>
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
            value={createForm.description}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Description"
            rows={4}
          />
          <input
            value={createForm.tagsCsv}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, tagsCsv: event.target.value }))}
            placeholder="tags, comma, separated"
          />
          <input
            value={createForm.link}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, link: event.target.value }))}
            placeholder="Public URL"
          />
          <input
            value={createForm.github}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, github: event.target.value }))}
            placeholder="GitHub URL"
          />
          <input
            type="number"
            value={createForm.order}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, order: event.target.value }))}
            placeholder="Order"
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
            {saving ? "Saving..." : "Create Project"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>All Projects</h2>
        {loading ? (
          <div className="empty">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty">No projects yet.</div>
        ) : (
          <div className="list">
            {projects.map((project) => {
              const isEditing = editingId === project.id;
              return (
                <article key={project.id} className="item">
                  {isEditing ? (
                    <>
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                      />
                      <input
                        value={editForm.slug}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, slug: event.target.value }))
                        }
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        rows={4}
                      />
                      <input
                        value={editForm.tagsCsv}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, tagsCsv: event.target.value }))
                        }
                        placeholder="tags, comma, separated"
                      />
                      <input
                        value={editForm.link}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, link: event.target.value }))
                        }
                        placeholder="Public URL"
                      />
                      <input
                        value={editForm.github}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, github: event.target.value }))
                        }
                        placeholder="GitHub URL"
                      />
                      <input
                        type="number"
                        value={editForm.order}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, order: event.target.value }))
                        }
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
                        <button type="button" onClick={() => handleSave(project.id)} disabled={saving}>
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
                        <strong>{project.title}</strong>
                        <span className={project.isPublished ? "pill on" : "pill"}>
                          {project.isPublished ? "Published" : "Draft"}
                        </span>
                      </header>
                      <div className="meta">/{project.slug} • order {project.order}</div>
                      <p>{project.description || "No description."}</p>
                      <div className="meta">Tags: {project.tags.join(", ") || "—"}</div>
                      <div className="meta">Link: {project.link || "—"}</div>
                      <div className="meta">GitHub: {project.github || "—"}</div>
                      <div className="actions">
                        <button type="button" onClick={() => startEdit(project)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(project.id)}
                        >
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
          word-break: break-word;
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
