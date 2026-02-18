"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchSession, logoutAdmin } from "@/lib/api";
import { APP_INITIALS, APP_NAME } from "@/lib/branding";

const navGroups = [
  {
    label: "Dashboard",
    links: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/appointments", label: "Appointments" },
      { href: "/dashboard/extensions", label: "WIP-Extensions" },
    ],
  },
  {
    label: "Content / Front-end",
    links: [
      { href: "/dashboard/content", label: "Content Hub" },
      { href: "/dashboard/content/site-settings", label: "Site Settings" },
      { href: "/dashboard/content/pages", label: "Pages" },
      { href: "/dashboard/content/projects", label: "Projects" },
      { href: "/dashboard/content/stats", label: "Stats" },
      { href: "/dashboard/content/skills", label: "Skills" },
      { href: "/dashboard/content/social-links", label: "Social Links" },
      { href: "/dashboard/content/contact-links", label: "Contact Links" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const session = await fetchSession();
      if (!session.ok || !session.data?.authenticated) {
        router.replace("/login");
        return;
      }
      setUsername(session.data.user?.username ?? null);
      setChecking(false);
    };
    loadSession();
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/login");
  };

  const isLinkActive = (href: string) => pathname === href;

  if (checking) {
    return (
      <main>
        <div className="card">Checking session...</div>
        <style jsx>{`
          .card {
            max-width: 340px;
            margin: 28vh auto 0;
            padding: 16px;
            border-radius: 12px;
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text-muted);
          }
        `}</style>
      </main>
    );
  }

  return (
    <div className="layout">
      <aside>
        <div className="topbar">
          <div className="brand">
            <div className="logo">{APP_INITIALS}</div>
            <div>
              <strong>{APP_NAME}</strong>
              <span>{username ?? "Admin"}</span>
            </div>
          </div>
          <button
            type="button"
            className="menuButton"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        <div className={`menu ${menuOpen ? "open" : ""}`}>
          <nav>
            {navGroups.map((group) => (
              <div key={group.label} className="navGroup">
                <span className="groupLabel">{group.label}</span>
                <div className="groupLinks">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`dashboardNavLink ${isLinkActive(link.href) ? "active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <button type="button" onClick={handleLogout} className="logout">
            Log out
          </button>
        </div>
      </aside>
      <section>{children}</section>
      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        aside {
          background: rgba(10, 10, 10, 0.88);
          color: var(--text);
          padding: 12px;
          display: grid;
          gap: 10px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .menuButton {
          border: 1px solid var(--border);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
          padding: 9px 12px;
          min-height: 40px;
          cursor: pointer;
        }
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--brand), var(--brand-strong));
          color: var(--on-brand);
          display: grid;
          place-items: center;
          font-weight: 700;
        }
        .brand span {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .menu {
          display: none;
          gap: 10px;
        }
        .menu.open {
          display: grid;
        }
        nav {
          display: grid;
          gap: 8px;
        }
        .navGroup {
          display: grid;
          gap: 7px;
          padding: 8px;
          border: 1px solid var(--border-muted);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
        }
        .groupLabel {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text);
          font-weight: 700;
          opacity: 0.9;
        }
        .groupLinks {
          display: grid;
          gap: 8px;
        }
        :global(.dashboardNavLink) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 13px;
          border-radius: 10px;
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border-muted);
          transition:
            background 140ms ease,
            border-color 140ms ease,
            transform 140ms ease,
            box-shadow 140ms ease,
            filter 140ms ease;
          white-space: normal;
          font-size: 14px;
          cursor: pointer;
        }
        :global(.dashboardNavLink.active) {
          background: var(--brand-soft);
          border-color: var(--brand-soft-border);
          color: var(--text);
        }
        :global(.dashboardNavLink:hover) {
          background: var(--brand-hover-bg);
          border-color: var(--brand-hover-border);
          color: #fffaf5;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
          filter: brightness(1.06);
        }
        :global(.dashboardNavLink:active) {
          transform: translateY(0);
          box-shadow: none;
          filter: none;
        }
        .logout {
          margin-top: 0;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition:
            background 140ms ease,
            transform 140ms ease,
            box-shadow 140ms ease;
          width: auto;
          justify-self: end;
        }
        .logout:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
        }
        .logout:active {
          transform: translateY(0);
          box-shadow: none;
        }
        section {
          padding: 0;
          animation: rise-in 220ms ease-out;
        }
        @media (min-width: 900px) {
          aside {
            position: sticky;
            top: 0;
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 16px 24px;
            gap: 10px;
            z-index: 40;
          }
          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .menuButton {
            display: none;
          }
          .menu {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }
          nav {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 10px;
            overflow: visible;
          }
          .navGroup {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-muted);
            padding: 10px;
            gap: 8px;
            min-width: 220px;
          }
          .groupLinks {
            display: flex;
            flex-wrap: wrap;
          }
          :global(.dashboardNavLink) {
            font-size: 15px;
          }
          .logout {
            margin-top: 0;
            width: auto;
            justify-self: end;
          }
          section {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
