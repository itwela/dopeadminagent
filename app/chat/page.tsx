"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThreadList } from "@/components/thread-list";
import { SimpleChat } from "@/components/simple-chat";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const workflowRunId = searchParams.get('workflowRunId');
  
  const [threadId, setThreadId] = useState<string | null>(null);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '0.75rem 1.5rem', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'var(--card-bg)'
      }}>
        <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          ← Back
        </Link>
        <Link href="/workflows" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Workflows
        </Link>
      </div>
      <div style={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: '320px 1fr',
        overflow: 'hidden'
      }}>
        <div style={{ borderRight: '1px solid var(--border)', background: 'var(--card-bg)' }}>
          <ThreadList selectedThreadId={threadId} onSelect={setThreadId} />
        </div>
        <div style={{ overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <SimpleChat 
              threadId={threadId} 
              onThreadChange={setThreadId}
              workflowRunId={workflowRunId || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}



