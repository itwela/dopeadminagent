"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  // Redirect to workflows page
  useEffect(() => {
    router.push("/workflows");
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center container">
      {/* Sign Out Button */}
      <motion.button
        className="btn btn-secondary"
        onClick={handleSignOut}
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          fontSize: "0.8125rem",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign Out
      </motion.button>
      <div className="max-w-3xl mx-auto text-center stack" style={{ gap: '2rem' }}>
        <div className="stack" style={{ gap: '0.5rem' }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: 600, 
            color: 'var(--foreground)',
            letterSpacing: '-0.025em'
          }}>
            Database Admin Agent
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
            Multi-database utilities ready for AI agents
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem',
          marginTop: '1.5rem'
        }}>
          <Link href="/test-functions/dope-core" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟣</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
              Dope Core
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Test functions →</div>
          </Link>

          <Link href="/test-functions/attom" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🟢</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
              ATTOM
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Test functions →</div>
          </Link>

          <Link href="/test-functions/crm" className="card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💜</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
              CRM
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Test functions →</div>
          </Link>
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <Link href="/chat" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Open Chat
          </Link>
          <Link href="/workflows" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Open Workflows
          </Link>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
          <p>3 of 3 databases connected</p>
        </div>
      </div>
    </div>
  );
}
