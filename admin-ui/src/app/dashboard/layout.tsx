"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchSession, logoutAdmin } from "@/lib/api";

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/appointments", label: "Appointments" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

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

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/login");
  };

  if (checking) {
    return (
      <main>
        <div className="card">Checking session...</div>
      </main>
    );
  }

  return (
    <div className="layout">
      <aside>
        <div className="brand">
          <div className="logo">PB</div>
          <div>
            <strong>Portfolio Admin</strong>
            <span>{username ?? "Admin"}</span>
          </div>
        </div>
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} className="logout">
          Log out
        </button>
      </aside>
      <section>{children}</section>
      <style jsx>{`
        .layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: 100vh;
        }
        aside {
          background: #111427;
          color: #f0f1f5;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #2f3560;
          display: grid;
          place-items: center;
          font-weight: 700;
        }
        .brand span {
          display: block;
          font-size: 12px;
          color: #9aa0c4;
          margin-top: 4px;
        }
        nav {
          display: grid;
          gap: 8px;
        }
        nav a {
          padding: 10px 12px;
          border-radius: 10px;
          background: transparent;
          color: inherit;
        }
        nav a.active,
        nav a:hover {
          background: #1e2240;
        }
        .logout {
          margin-top: auto;
          background: #2f3560;
          border: none;
          color: white;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
        }
        section {
          padding: 32px;
        }
        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
          aside {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          nav {
            display: flex;
            gap: 8px;
          }
          .logout {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
