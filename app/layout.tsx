import './globals.css';
import Link from 'next/link';

export const metadata = {
    title: 'Real-Time Poll Rooms',
    description: 'Instant, fair, and beautiful real-time polling.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body suppressHydrationWarning style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <header style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50
                }}>
                    <div className="container" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ textDecoration: 'none', fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Poll Rooms
                        </Link>
                        <nav style={{ display: 'flex', gap: '1rem' }}>
                            <Link href="/" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: 'var(--radius)', transition: 'background 0.2s' }}>
                                New Poll
                            </Link>
                            <a href="https://github.com/dev9923/Real-Time-Poll-Rooms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 1rem' }}>
                                GitHub
                            </a>
                        </nav>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '2rem 0' }}>
                    {children}
                </main>

                <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', backgroundColor: 'var(--background)', color: 'var(--muted)', textAlign: 'center', fontSize: '0.875rem' }}>
                    <div className="container">
                        <p>&copy; {new Date().getFullYear()} Real-Time Poll Rooms. All rights reserved.</p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
