"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminContent } from "@/lib/api";

type ContentSummary = {
  settings: number;
  pages: number;
  projects: number;
  stats: number;
  skills: number;
  socialLinks: number;
  contactLinks: number;
};

const routes = [
  {
    href: "/dashboard/content/site-settings",
    title: "Site Settings",
    description: "Edit global key-value settings.",
    key: "settings" as const,
  },
  {
    href: "/dashboard/content/pages",
    title: "Pages",
    description: "Create and edit static pages.",
    key: "pages" as const,
  },
  {
    href: "/dashboard/content/projects",
    title: "Projects",
    description: "Manage project cards and publish state.",
    key: "projects" as const,
  },
  {
    href: "/dashboard/content/stats",
    title: "Stats",
    description: "Manage number/label metric cards.",
    key: "stats" as const,
  },
  {
    href: "/dashboard/content/skills",
    title: "Skills",
    description: "Manage ordered skills list.",
    key: "skills" as const,
  },
  {
    href: "/dashboard/content/social-links",
    title: "Social Links",
    description: "Manage social profile links.",
    key: "socialLinks" as const,
  },
  {
    href: "/dashboard/content/contact-links",
    title: "Contact Links",
    description: "Manage contact CTA links.",
    key: "contactLinks" as const,
  },
];

export default function ContentPage() {
  const [summary, setSummary] = useState<ContentSummary>({
    settings: 0,
    pages: 0,
    projects: 0,
    stats: 0,
    skills: 0,
    socialLinks: 0,
    contactLinks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const content = await fetchAdminContent();
      setSummary({
        settings: content.settings.data?.settings?.length ?? 0,
        pages: content.pages.data?.pages?.length ?? 0,
        projects: content.projects.data?.projects?.length ?? 0,
        stats: content.stats.data?.stats?.length ?? 0,
        skills: content.skills.data?.skills?.length ?? 0,
        socialLinks: content.socialLinks.data?.socialLinks?.length ?? 0,
        contactLinks: content.contactLinks.data?.contactLinks?.length ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main>
      <h1>Content</h1>
      <p>Choose a section to manage records.</p>

      <section className="grid">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className="card">
            <h2>{route.title}</h2>
            <p>{route.description}</p>
            <span>{loading ? "..." : `${summary[route.key]} records`}</span>
          </Link>
        ))}
      </section>

      <section className="panel">
        <h2>Read-Only Snapshot</h2>
        <div className="counts">
          <div>Site Settings: {loading ? "..." : summary.settings}</div>
          <div>Pages: {loading ? "..." : summary.pages}</div>
          <div>Projects: {loading ? "..." : summary.projects}</div>
          <div>Stats: {loading ? "..." : summary.stats}</div>
          <div>Skills: {loading ? "..." : summary.skills}</div>
          <div>Social Links: {loading ? "..." : summary.socialLinks}</div>
          <div>Contact Links: {loading ? "..." : summary.contactLinks}</div>
        </div>
      </section>

      <style jsx>{`
        h1 {
          margin: 0 0 6px;
        }
        p {
          margin: 0 0 20px;
          color: var(--text-muted);
        }
        .grid {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr;
          margin-bottom: 16px;
        }
        .card {
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow);
          padding: 16px;
          display: grid;
          gap: 8px;
        }
        .card h2 {
          margin: 0;
        }
        .card p {
          margin: 0;
        }
        .card span {
          color: var(--text);
          font-weight: 600;
        }
        .panel {
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow);
          padding: 16px;
        }
        .panel h2 {
          margin: 0 0 10px;
        }
        .counts {
          display: grid;
          gap: 8px;
          color: var(--text-muted);
        }
        @media (min-width: 680px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
