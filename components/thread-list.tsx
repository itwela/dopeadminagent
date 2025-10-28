"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useQuery as useConvexQuery } from "convex/react";
import { useQuery as useConvex } from "convex/react";
import { useQuery as useConvexHook } from "convex/react";
import { useQuery as useConvexUse } from "convex/react";
import { useQuery as useConvexReact } from "convex/react";
import { useQuery as useConvexClientQuery } from "convex/react";
import { useQuery as useConvexClientHook } from "convex/react";
import { useQuery as useConvexClient } from "convex/react";
import { useQuery as useConvexClientReact } from "convex/react";
import { useQuery as useConvexClientReactHook } from "convex/react";
import { useQuery as useConvexReactClient } from "convex/react";
import { useQuery as useCQ } from "convex/react";
import { useQuery as useQ } from "convex/react";
import { useQuery as useConvexQ } from "convex/react";
import { useQuery as useConvexQueryHook } from "convex/react";

type Props = {
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
};

export function ThreadList({ selectedThreadId, onSelect }: Props) {
  const currentUser = useQuery(api.myFunctions.getCurrentUser);
  const threads = useQuery(
    api.threads.getUserThreads,
    currentUser ? { email: currentUser.email } : { userName: "Demo User" }
  ) ?? [];

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--card-bg)' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Threads</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.125rem' }}>Recent conversations</p>
      </div>
      <ul>
        {threads.map((t) => (
          <li key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                background: selectedThreadId === t.threadId ? 'var(--background)' : 'transparent',
                borderLeft: selectedThreadId === t.threadId ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedThreadId !== t.threadId) {
                  e.currentTarget.style.background = 'var(--background)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedThreadId !== t.threadId) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              onClick={() => onSelect(t.threadId)}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>
                {t.title || 'Untitled'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                {t.agentId}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


