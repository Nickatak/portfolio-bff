"use client";

import { useEffect, useState } from "react";
import { fetchAdminContent } from "@/lib/api";

type SectionProps = {
  title: string;
  items: unknown[];
};

function Section({ title, items }: SectionProps) {
  return (
    <div className="section">
      <header>
        <h2>{title}</h2>
        <span>{items.length} items</span>
      </header>
      <pre>{JSON.stringify(items, null, 2)}</pre>
      <style jsx>{`
        .section {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(20, 22, 34, 0.08);
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
        }
        h2 {
          margin: 0;
        }
        span {
          color: #7b8094;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        pre {
          margin: 0;
          background: #f5f6fb;
          padding: 12px;
          border-radius: 10px;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}

export default function ContentPage() {
  const [data, setData] = useState({
    settings: [],
    pages: [],
    projects: [],
    stats: [],
    skills: [],
    socialLinks: [],
    contactLinks: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const content = await fetchAdminContent();
      setData({
        settings: content.settings.data?.settings ?? [],
        pages: content.pages.data?.pages ?? [],
        projects: content.projects.data?.projects ?? [],
        stats: content.stats.data?.stats ?? [],
        skills: content.skills.data?.skills ?? [],
        socialLinks: content.socialLinks.data?.socialLinks ?? [],
        contactLinks: content.contactLinks.data?.contactLinks ?? [],
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <main>Loading content…</main>;
  }

  return (
    <main>
      <h1>Content Library</h1>
      <p>Read-only view for now. Editing interfaces land next.</p>
      <div className="grid">
        <Section title="Site Settings" items={data.settings} />
        <Section title="Pages" items={data.pages} />
        <Section title="Projects" items={data.projects} />
        <Section title="Stats" items={data.stats} />
        <Section title="Skills" items={data.skills} />
        <Section title="Social Links" items={data.socialLinks} />
        <Section title="Contact Links" items={data.contactLinks} />
      </div>
      <style jsx>{`
        h1 {
          margin: 0 0 6px;
        }
        p {
          margin: 0 0 24px;
          color: #5a5f73;
        }
        .grid {
          display: grid;
          gap: 20px;
        }
      `}</style>
    </main>
  );
}
