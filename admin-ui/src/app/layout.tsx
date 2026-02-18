import './globals.css';

export const metadata = {
  title: 'Portfolio Admin',
  description: 'Admin UI for portfolio content and appointments.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
