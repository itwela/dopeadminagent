"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "../interfaces/agentChatInterfaces";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Rich markdown renderers for better readability in chat
const tryFormatJson = (raw: string): string | null => {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
};

const markdownComponents = {
  h1: (props: any) => (
    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem', marginTop: '0.75rem' }} {...props} />
  ),
  h2: (props: any) => (
    <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem', marginTop: '0.75rem' }} {...props} />
  ),
  h3: (props: any) => (
    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem', marginTop: '0.75rem' }} {...props} />
  ),
  h4: (props: any) => (
    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem', marginTop: '0.75rem' }} {...props} />
  ),
  p: (props: any) => (
    <p style={{ lineHeight: 1.6, marginBottom: '0.5rem' }} {...props} />
  ),
  ul: (props: any) => (
    <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', marginBottom: '0.5rem' }} {...props} />
  ),
  ol: (props: any) => (
    <ol style={{ listStyleType: 'decimal', paddingLeft: '1.25rem', marginBottom: '0.5rem' }} {...props} />
  ),
  li: (props: any) => (
    <li style={{ lineHeight: 1.5, marginBottom: '0.25rem' }} {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      style={{ borderLeft: '3px solid var(--border)', paddingLeft: '0.75rem', fontStyle: 'italic', color: 'var(--muted)', marginBottom: '0.5rem' }}
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: ({ inline, className, children, ...rest }: any) => {
    if (inline) {
      return (
        <code
          style={{ background: 'var(--background)', color: 'var(--foreground)', padding: '0.125rem 0.375rem', borderRadius: 'calc(var(--radius) - 0.25rem)', fontSize: '0.8125rem' }}
          {...rest}
        >
          {children}
        </code>
      );
    }
    const raw = String(children ?? '').trim();
    const formatted =
      className?.includes('language-json') ? tryFormatJson(raw) : tryFormatJson(raw);
    const codeContent = formatted ?? raw;
    const finalClass = className?.includes('language-json') || formatted
      ? 'language-json'
      : className;
    return (
      <code className={finalClass} {...rest}>
        {codeContent}
      </code>
    );
  },
  pre: (props: any) => (
    <pre
      style={{ background: '#18181b', color: '#f1f5f9', padding: '0.75rem', borderRadius: 'calc(var(--radius) - 0.125rem)', overflowX: 'auto', fontSize: '0.75rem', marginBottom: '0.5rem' }}
      {...props}
    />
  ),
  table: (props: any) => (
    <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
      <table style={{ minWidth: '100%', fontSize: '0.8125rem' }} {...props} />
    </div>
  ),
  th: (props: any) => (
    <th style={{ borderBottom: '1px solid var(--border)', padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }} {...props} />
  ),
  td: (props: any) => (
    <td style={{ borderBottom: '1px solid var(--border)', padding: '0.5rem 0.75rem', verticalAlign: 'top' }} {...props} />
  ),
};

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
  const currentUser = useQuery(api.myFunctions.getCurrentUser);

  // Load existing thread history; always call hook with stable arg shape
  const selectedThread = useQuery(
    api.threads.getThread,
    activeThreadId ? { threadId: activeThreadId } : "skip"
  );

  // Initialize thread from workflow results if workflowRunId is provided
  useEffect(() => {
    if (workflowRunId && !workflowThreadInitialized && !activeThreadId && !isLoading) {
      setIsLoading(true);
      setWorkflowThreadInitialized(true); // Set this immediately to prevent duplicate calls
      
      createThreadFromWorkflow({
        workflowRunId,
        userId: currentUser?._id || "demo-user",
        userName: currentUser?.name || currentUser?.email || "Demo User",
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
          setWorkflowThreadInitialized(false); // Reset on error so user can retry
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
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId: activeThreadId || null,
          agentId: 'db-admin-agent',
          userId: currentUser?._id,
          userName: currentUser?.name || currentUser?.email,
          email: currentUser?.email,
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
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'system',
              content: 'Request failed',
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Network error', timestamp: new Date() },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: 'Unexpected error', timestamp: new Date() },
      ]);
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

  // Check scroll position
  const checkScrollPosition = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 50; // pixels from bottom to be considered "at bottom"
    
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
    
    setIsAtBottom(atBottom);
    
    // Show button if content is scrollable and either not at bottom OR at bottom (to allow scrolling up)
    setShowScrollButton(scrollHeight > clientHeight);
  };

  // Handle scroll events
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  // Check scroll position when messages change
  useEffect(() => {
    checkScrollPosition();
  }, [displayedMessages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Show loading state while initializing workflow thread
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
              You&apos;re chatting with the results of your workflow analysis. Ask any questions about the insights!
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
          // Check if this is the workflow context message
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
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {expandedWorkflowContext ? '▼ Collapse' : '▶ Expand Full Context'}
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                {(() => {
                  const formattedJson = tryFormatJson(message.content);
                  if (formattedJson) {
                    return (
                      <pre style={{ background: '#18181b', color: '#f1f5f9', padding: '0.75rem', borderRadius: 'calc(var(--radius) - 0.125rem)', overflowX: 'auto', fontSize: '0.75rem' }}>
                        <code className="language-json">{formattedJson}</code>
                      </pre>
                    );
                  }
                  
                  // If it's workflow context and collapsed, show a preview
                  if (isWorkflowContext && !expandedWorkflowContext) {
                    const lines = message.content.split('\n');
                    const preview = lines.slice(0, 5).join('\n');
                    return (
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {preview + '\n\n...'}
                        </ReactMarkdown>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          Click &quot;Expand Full Context&quot; to see all workflow steps
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  );
                })()}
              </div>
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                  <strong>Tools used:</strong> {message.toolCalls.map((tc) => tc.name).join(', ')}
                </div>
              )}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
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


