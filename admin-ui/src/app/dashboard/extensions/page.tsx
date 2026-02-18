"use client";

export default function ExtensionsPage() {
  const planned = [
    "Custom widgets",
    "Automation hooks",
    "Insights panels",
    "3rd-party adapters",
  ];

  return (
    <main>
      <h1>WIP-Extensions</h1>
      <p>Reserved workspace for upcoming dashboard modules.</p>
      <section className="panel">
        <h2>Planned Slots</h2>
        <ul>
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow);
          padding: 16px;
        }
        h2 {
          margin: 0 0 12px;
          font-size: 18px;
        }
        ul {
          margin: 0;
          padding-left: 20px;
          display: grid;
          gap: 8px;
          color: var(--text);
        }
        li::marker {
          color: var(--brand);
        }
      `}</style>
    </main>
  );
}
