"use client";

import { useEffect, useState } from "react";
import { fetchAdminContent, fetchAppointments } from "@/lib/api";

export default function DashboardPage() {
  const [contentCounts, setContentCounts] = useState({
    pages: 0,
    projects: 0,
    stats: 0,
    skills: 0,
    socialLinks: 0,
    contactLinks: 0,
    appointments: 0,
  });

  useEffect(() => {
    const load = async () => {
      const content = await fetchAdminContent();
      const appointments = await fetchAppointments();
      setContentCounts({
        pages: content.pages.data?.pages?.length ?? 0,
        projects: content.projects.data?.projects?.length ?? 0,
        stats: content.stats.data?.stats?.length ?? 0,
        skills: content.skills.data?.skills?.length ?? 0,
        socialLinks: content.socialLinks.data?.socialLinks?.length ?? 0,
        contactLinks: content.contactLinks.data?.contactLinks?.length ?? 0,
        appointments: appointments.data?.appointments?.length ?? 0,
      });
    };
    load();
  }, []);

  return (
    <main>
      <h1>Admin Overview</h1>
      <p>Quick glance at live content and recent appointments.</p>
      <div className="grid">
        {Object.entries(contentCounts).map(([label, value]) => (
          <div key={label} className="card">
            <span className="label">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
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
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(20, 22, 34, 0.08);
        }
        .label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7b8094;
        }
        strong {
          display: block;
          margin-top: 8px;
          font-size: 24px;
        }
      `}</style>
    </main>
  );
}
