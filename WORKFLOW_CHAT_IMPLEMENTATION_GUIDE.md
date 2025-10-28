# Workflow-to-Chat Integration Implementation Guide

## Overview
This guide provides a complete implementation plan for integrating workflow results into a chat system, allowing users to have conversations with AI agents about their workflow analysis results.

## Core Concept
When a user completes a workflow analysis, they can click "Chat with Results" to create a new chat thread that contains all workflow results as context. The AI agent then has full access to the analysis and can answer questions, provide insights, and help explore the results.

## Required Dependencies
```json
{
  "dependencies": {
    "convex": ,
    "next": 
    "react": 
    "react-markdown": 
    "remark-gfm": 
    "@openai/agents": 
    "zod": 
  }
}
```

## Implementation Steps

### 1. Database Schema (Convex)

Create these tables in your `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  // Conversation threads for agent chat
  conversationThreads: defineTable({
    threadId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    agentId: v.string(),
    title: v.string(),
    projectId: v.optional(v.string()),
    history: v.array(v.any()),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_thread_id", ["threadId"]) 
    .index("by_user_id", ["userId"]) 
    .index("by_user_name", ["userName"]) 
    .index("by_agent_id", ["agentId"]),

  // Workflow runs table for storing workflow run metadata
  workflowRuns: defineTable({
    workflowRunId: v.string(), // Unique ID for the workflow run
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    title: v.string(), // Generated title for the workflow run
    clientName: v.optional(v.string()), // Client name if provided
    threadId: v.optional(v.string()), // Optional link to the conversation thread
    status: v.string(), // Status: running, completed, failed
    createdAt: v.number(), // When the workflow was created
    completedAt: v.optional(v.number()), // When the workflow completed
    metadata: v.optional(v.any()), // Any additional metadata
  })
    .index("by_workflow_run_id", ["workflowRunId"])
    .index("by_user_id", ["userId"])
    .index("by_user_name", ["userName"])
    .index("by_thread_id", ["threadId"])
    .index("by_status", ["status"]),

  // Workflow results table for storing agent responses from workflows
  workflowResults: defineTable({
    workflowRunId: v.string(), // Unique ID that groups all responses from one workflow run
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    stepNumber: v.number(), // Which step in the workflow (1, 2, 3, etc.)
    agentName: v.string(), // Name of the agent that generated this response
    stepTitle: v.string(), // Title/description of this workflow step
    response: v.string(), // The actual agent response content
    timestamp: v.number(), // When this step completed
    threadId: v.optional(v.string()), // Optional link to the conversation thread
    metadata: v.optional(v.any()), // Any additional metadata for this step
  })
    .index("by_workflow_run_id", ["workflowRunId"])
    .index("by_user_id", ["userId"])
    .index("by_user_name", ["userName"])
    .index("by_thread_id", ["threadId"])
    .index("by_workflow_run_and_step", ["workflowRunId", "stepNumber"]),
});
```

### 2. Convex Functions (convex/threads.ts)

Create the core functions for thread and workflow management:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Basic thread functions
export const getThread = query({
  args: { threadId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("conversationThreads"),
      _creationTime: v.number(),
      threadId: v.string(),
      userId: v.optional(v.string()),
      userName: v.optional(v.string()),
      agentId: v.string(),
      title: v.string(),
      projectId: v.optional(v.string()),
      history: v.array(v.any()),
      lastUpdated: v.number(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("conversationThreads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();
    return thread;
  },
});

export const createThread = mutation({
  args: {
    threadId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    agentId: v.string(),
    title: v.string(),
    projectId: v.optional(v.string()),
    history: v.array(v.any()),
  },
  returns: v.id("conversationThreads"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("conversationThreads", {
      threadId: args.threadId,
      userId: args.userId,
      userName: args.userName,
      agentId: args.agentId,
      title: args.title,
      projectId: args.projectId,
      history: args.history,
      lastUpdated: now,
      createdAt: now,
    });
    return id;
  },
});

// Workflow functions
export const createWorkflowRun = mutation({
  args: {
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    title: v.string(),
    clientName: v.optional(v.string()),
    threadId: v.optional(v.string()),
    status: v.string(),
  },
  returns: v.id("workflowRuns"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("workflowRuns", {
      workflowRunId: args.workflowRunId,
      userId: args.userId,
      userName: args.userName,
      title: args.title,
      clientName: args.clientName,
      threadId: args.threadId,
      status: args.status,
      createdAt: now,
      metadata: {}
    });
    return id;
  },
});

export const saveWorkflowResult = mutation({
  args: {
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    stepNumber: v.number(),
    agentName: v.string(),
    stepTitle: v.string(),
    response: v.string(),
    threadId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("workflowResults"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("workflowResults", {
      workflowRunId: args.workflowRunId,
      userId: args.userId,
      userName: args.userName,
      stepNumber: args.stepNumber,
      agentName: args.agentName,
      stepTitle: args.stepTitle,
      response: args.response,
      timestamp: now,
      threadId: args.threadId,
      metadata: args.metadata,
    });
    return id;
  },
});

export const getWorkflowResults = query({
  args: { workflowRunId: v.string() },
  returns: v.array(v.object({
    _id: v.id("workflowResults"),
    _creationTime: v.number(),
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    stepNumber: v.number(),
    agentName: v.string(),
    stepTitle: v.string(),
    response: v.string(),
    timestamp: v.number(),
    threadId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("workflowResults")
      .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
      .order("asc")
      .collect();
    return results;
  },
});

// KEY FUNCTION: Create thread from workflow results
export const createThreadFromWorkflow = mutation({
  args: {
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.string(),
    title: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      console.log('[createThreadFromWorkflow] Starting for workflowRunId:', args.workflowRunId);
      
      // Get the workflow run
      const workflowRun = await ctx.db
        .query("workflowRuns")
        .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
        .first();
      
      if (!workflowRun) {
        console.error('[createThreadFromWorkflow] Workflow run not found:', args.workflowRunId);
        throw new Error(`Workflow run not found: ${args.workflowRunId}`);
      }
      
      // Check if a thread already exists for this workflow
      const existingThreadId = workflowRun.threadId;
      if (existingThreadId) {
        const existingThread = await ctx.db
          .query("conversationThreads")
          .withIndex("by_thread_id", (q) => q.eq("threadId", existingThreadId))
          .first();
        
        if (existingThread) {
          console.log('[createThreadFromWorkflow] Returning existing thread');
          return {
            threadId: existingThread.threadId,
            title: existingThread.title,
          };
        }
      }
      
      // Get all workflow results
      const results = await ctx.db
        .query("workflowResults")
        .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
        .order("asc")
        .collect();
      
      if (results.length === 0) {
        throw new Error("No workflow results found");
      }
      
      // Format all results into a comprehensive context message
      // Truncate very long responses to avoid hitting Convex size limits
      let contextMessage = `# Workflow Analysis Results\n\n`;
      contextMessage += `**Client:** ${workflowRun.clientName || 'N/A'}\n`;
      contextMessage += `**Analysis Date:** ${new Date(workflowRun.createdAt).toLocaleDateString()}\n\n`;
      contextMessage += `---\n\n`;
      
      for (const result of results) {
        contextMessage += `## Step ${result.stepNumber}: ${result.stepTitle}\n\n`;
        contextMessage += `**Agent:** ${result.agentName}\n\n`;
        
        // Truncate response if too long (keep first 10000 chars)
        const truncatedResponse = result.response.length > 10000 
          ? result.response.substring(0, 10000) + '\n\n...[Content truncated for brevity]...'
          : result.response;
        
        contextMessage += `${truncatedResponse}\n\n`;
        contextMessage += `---\n\n`;
      }
      
      contextMessage += `\nYou can now ask me questions about this workflow analysis, request specific insights, or explore any aspect of the results in more detail.`;
      
      // Create a new thread with the workflow context
      const threadId = `workflow-thread-${args.workflowRunId}`;
      const now = Date.now();
      
      const history: Array<any> = [
        {
          role: 'system' as const,
          content: contextMessage,
          timestamp: now,
          agentName: 'Workflow Context',
        }
      ];
      
      await ctx.db.insert("conversationThreads", {
        threadId,
        userId: args.userId,
        userName: args.userName,
        agentId: 'db-admin-agent', // Replace with your agent ID
        title: `Chat: ${workflowRun.title}`,
        history,
        lastUpdated: now,
        createdAt: now,
      });
      
      // Link the thread back to the workflow run
      await ctx.db.patch(workflowRun._id, {
        threadId,
      });
      
      return {
        threadId,
        title: `Chat: ${workflowRun.title}`,
      };
    } catch (error) {
      console.error('[createThreadFromWorkflow] Error:', error);
      throw error;
    }
  },
});
```

### 3. Chat Component (components/simple-chat.tsx)

Create a chat component with workflow integration:

```typescript
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentName?: string;
  timestamp: Date;
  toolCalls?: Array<{ name: string; arguments: any; result?: any }>;
}

type SimpleChatProps = {
  threadId?: string | null;
  onThreadChange?: (threadId: string | null) => void;
  workflowRunId?: string;
};

export function SimpleChat({ threadId: controlledThreadId = null, onThreadChange, workflowRunId }: SimpleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [internalThreadId, setInternalThreadId] = useState<string | null>(null);
  const [workflowThreadInitialized, setWorkflowThreadInitialized] = useState(false);
  const [expandedWorkflowContext, setExpandedWorkflowContext] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeThreadId = controlledThreadId ?? internalThreadId;

  // Mutation to create a thread from workflow results
  const createThreadFromWorkflow = useMutation(api.threads.createThreadFromWorkflow);

  // Load existing thread history
  const selectedThread = useQuery(
    api.threads.getThread,
    activeThreadId ? { threadId: activeThreadId } : "skip"
  );

  // Initialize thread from workflow results if workflowRunId is provided
  useEffect(() => {
    if (workflowRunId && !workflowThreadInitialized && !activeThreadId && !isLoading) {
      setIsLoading(true);
      setWorkflowThreadInitialized(true);
      
      createThreadFromWorkflow({
        workflowRunId,
        userId: "demo-user", // Replace with your user system
        userName: "Demo User",
      })
        .then((result) => {
          if (onThreadChange) {
            onThreadChange(result.threadId);
          } else {
            setInternalThreadId(result.threadId);
          }
        })
        .catch((error) => {
          console.error("Failed to create thread from workflow:", error);
          setMessages([
            {
              role: 'system',
              content: `Failed to load workflow results: ${error.message}`,
              timestamp: new Date(),
            },
          ]);
          setWorkflowThreadInitialized(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [workflowRunId, workflowThreadInitialized, activeThreadId, isLoading, createThreadFromWorkflow, onThreadChange]);

  const displayedMessages: ChatMessage[] = useMemo(() => {
    if (selectedThread?.history && Array.isArray(selectedThread.history)) {
      return selectedThread.history.map((m: any) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        agentName: m.agentName,
        timestamp: new Date((m.timestamp as number) ?? Date.now()),
        toolCalls: m.toolCalls,
      }));
    }
    return messages;
  }, [selectedThread, messages]);

  // Scroll functionality
  const checkScrollPosition = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 50;
    
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setIsAtBottom(atBottom);
    setShowScrollButton(scrollHeight > clientHeight);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  useEffect(() => {
    checkScrollPosition();
  }, [displayedMessages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Replace with your chat API endpoint
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId: activeThreadId || null,
          agentId: 'your-agent-id',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: data.message,
            agentName: data.agentName,
            timestamp: new Date(),
            toolCalls: data.toolCalls,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          if (data.threadId && data.threadId !== activeThreadId) {
            if (onThreadChange) onThreadChange(data.threadId);
            else setInternalThreadId(data.threadId);
          }
        }
      }
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Loading state for workflow initialization
  if (workflowRunId && !workflowThreadInitialized && isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '56rem', margin: '0 auto', padding: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
            Loading Workflow Results...
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
            Preparing your workflow analysis for chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '56rem', margin: '0 auto', padding: '1.5rem', position: 'relative' }}>
      {/* Workflow indicator banner */}
      {workflowRunId && workflowThreadInitialized && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>📊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground)' }}>
              Workflow Analysis Chat
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>
              You're chatting with the results of your workflow analysis. Ask any questions about the insights!
            </div>
          </div>
        </div>
      )}

      <div 
        ref={messagesContainerRef}
        className="stack" 
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: '1rem', position: 'relative' }}
      >
        {displayedMessages.map((message, index) => {
          const isWorkflowContext = message.role === 'system' && message.agentName === 'Workflow Context';
          
          return (
            <div
              key={index}
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                maxWidth: isWorkflowContext ? '95%' : '85%',
                ...(message.role === 'user'
                  ? {
                      marginLeft: 'auto',
                      background: 'var(--accent)',
                      color: 'white',
                      borderColor: 'var(--accent)',
                    }
                  : message.role === 'system'
                  ? {
                      marginRight: 'auto',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
                      color: 'var(--foreground)',
                      borderColor: 'rgba(99, 102, 241, 0.2)',
                    }
                  : {
                      marginRight: 'auto',
                      background: 'var(--card-bg)',
                      color: 'var(--foreground)',
                    }),
              }}
            >
              <div style={{ fontSize: '0.6875rem', color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--muted)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{message.agentName || message.role}</span>
                {isWorkflowContext && (
                  <button
                    onClick={() => setExpandedWorkflowContext(!expandedWorkflowContext)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'calc(var(--radius) - 0.25rem)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {expandedWorkflowContext ? '▼ Collapse' : '▶ Expand Full Context'}
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                {(() => {
                  if (isWorkflowContext && !expandedWorkflowContext) {
                    const lines = message.content.split('\n');
                    const preview = lines.slice(0, 5).join('\n');
                    return (
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {preview + '\n\n...'}
                        </ReactMarkdown>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          Click "Expand Full Context" to see all workflow steps
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  );
                })()}
              </div>
            </div>
          );
        })}
        {isLoading && !workflowRunId && (
          <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--muted)' }}>Thinking...</div>
        )}
      </div>

      {/* Floating Scroll Button */}
      {showScrollButton && (
        <button
          onClick={isAtBottom ? scrollToTop : scrollToBottom}
          style={{
            position: 'absolute',
            bottom: '5rem',
            right: '2rem',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--card-bg)',
            color: 'var(--accent)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            opacity: 0.9,
          }}
          title={isAtBottom ? 'Scroll to Top' : 'Scroll to Bottom'}
        >
          {isAtBottom ? '↑' : '↓'}
        </button>
      )}

      <div className="row" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{ flex: 1 }}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="btn btn-primary"
          style={{ opacity: isLoading ? 0.5 : 1 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### 4. Chat Page (app/chat/page.tsx)

Create the chat page with workflow support:

```typescript
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
        overflow: 'hidden', 
        display: 'flex' 
      }}>
        <div style={{ flex: 1 }}>
          <SimpleChat 
            threadId={threadId} 
            onThreadChange={setThreadId}
            workflowRunId={workflowRunId || undefined}
          />
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
```

### 5. Workflow Integration

In your workflow page, add a "Chat with Results" button:

```typescript
// In your workflow results component
{selectedRun && workflowResults.length > 0 && (
  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
    <Link
      href={`/chat?workflowRunId=${selectedRun.workflowRunId}`}
      className="btn btn-primary"
      style={{ textDecoration: 'none' }}
    >
      💬 Chat with Results
    </Link>
  </div>
)}
```

### 6. Key Features Implemented

✅ **Workflow Context Loading**: Automatically loads all workflow results into chat context  
✅ **Collapsible Context**: Workflow results are collapsed by default with expand option  
✅ **Smart Scroll Button**: Floating button for easy navigation  
✅ **Duplicate Prevention**: Prevents creating multiple threads for same workflow  
✅ **Error Handling**: Comprehensive error logging and user feedback  
✅ **Response Truncation**: Prevents hitting Convex size limits  
✅ **Visual Indicators**: Clear UI showing when chatting with workflow results  

### 7. Usage Flow

1. User completes a workflow analysis
2. Workflow results are saved to `workflowResults` table
3. User clicks "💬 Chat with Results" button
4. System creates/retrieves thread with all workflow results as context
5. User can ask questions about the analysis
6. AI agent has full access to all workflow steps and can provide insights

### 8. Customization Points

- **Agent ID**: Replace `'db-admin-agent'` with your agent identifier
- **User System**: Replace demo user system with your authentication
- **Chat API**: Update the chat API endpoint to match your implementation
- **Styling**: Customize colors, spacing, and visual elements to match your design system
- **Workflow Steps**: Adjust the context message format to match your workflow structure

This implementation provides a complete workflow-to-chat integration that allows users to have meaningful conversations about their analysis results!
