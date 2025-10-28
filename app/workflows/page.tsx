"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexClient } from "../providers/clientConvexProvision";
import ClientConvexProvision from "../providers/clientConvexProvision";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

interface WorkflowRun {
  _id: string;
  workflowRunId: string;
  userId?: string;
  userName?: string;
  title: string;
  clientName?: string;
  threadId?: string;
  status: string;
  createdAt: number;
  completedAt?: number;
  metadata?: any;
}

interface WorkflowResult {
  _id: string;
  workflowRunId: string;
  stepNumber: number;
  agentName: string;
  stepTitle: string;
  response: string;
  timestamp: number;
  threadId?: string;
}

export default function WorkflowsPage() {
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [clientName, setClientName] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<string>("");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const convex = useConvexClient();
  const { signOut } = useAuthActions();
  const router = useRouter();
  
  // Get current user information
  const currentUser = useQuery(api.myFunctions.getCurrentUser);
  
  // Use Convex hooks to get data
  const workflowRuns = useQuery(api.threads.getWorkflowRunsForUser, {
    email: currentUser?.email,
    userName: currentUser?.name || currentUser?.email || undefined,
    limit: 50
  }) || [];
  
  const workflowResults = useQuery(
    api.threads.getWorkflowResults,
    selectedRun ? { workflowRunId: selectedRun.workflowRunId } : "skip"
  ) || [];

  const openClientModal = () => {
    setShowClientModal(true);
    setClientName("");
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setClientName("");
  };

  const runNewWorkflow = async () => {
    if (!clientName.trim()) {
      alert("Please enter a client name");
      return;
    }

    // Close the modal immediately when workflow starts
    closeClientModal();
    
    setRunningWorkflow(true);
    setWorkflowStatus("Starting workflow...");
    
    try {
      // Call the API route to run the workflow (server-side)
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?._id || "demo-user",
          userName: currentUser?.name || currentUser?.email || "Demo User",
          email: currentUser?.email,
          threadId: null,
          clientName: clientName.trim()
        })
      });
      
      setWorkflowStatus("Processing workflow...");
      const result = await response.json();
      
      if (result.success) {
        setWorkflowStatus("Workflow completed successfully!");
        // Auto-select the new workflow run
        const newRun = workflowRuns.find(run => run.workflowRunId === result.workflowRunId);
        if (newRun) {
          setSelectedRun(newRun);
        }
      } else {
        setWorkflowStatus("Workflow failed");
        console.error('Workflow failed:', result.error);
        alert(`Workflow failed: ${result.error}`);
      }
    } catch (error) {
      setWorkflowStatus("Workflow failed");
      console.error('Failed to run workflow:', error);
      alert(`Failed to run workflow: ${error}`);
    } finally {
      setRunningWorkflow(false);
      setTimeout(() => setWorkflowStatus(""), 3000); // Clear status after 3 seconds
    }
  };

  const handleRunSelect = (run: WorkflowRun) => {
    setSelectedRun(run);
    // Start with all steps collapsed by default
    setExpandedSteps(new Set());
  };

  const toggleStepExpansion = (stepNumber: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  const deleteWorkflow = async (workflowRunId: string) => {
    if (!confirm('Are you sure you want to delete this workflow run? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/workflow/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowRunId })
      });

      const result = await response.json();
      
      if (result.success) {
        // If the deleted workflow was selected, clear selection
        if (selectedRun?.workflowRunId === workflowRunId) {
          setSelectedRun(null);
        }
        // The useQuery hook will automatically refetch and update the list
      } else {
        alert(`Failed to delete workflow: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert(`Failed to delete workflow: ${error}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Progress indicator component
  const ProgressIndicator = ({ run }: { run: WorkflowRun }) => {
    const currentStep = run.metadata?.currentStep || 0;
    const totalSteps = run.metadata?.totalSteps || 5;
    const progress = (currentStep / totalSteps) * 100;
    
    const stepNames = [
      "Context Builder",
      "Job Analyzer", 
      "Targeting Strategy",
      "Find New Contacts",
      "Generate Title"
    ];

    return (
      <div style={{ marginTop: '0.5rem' }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--muted)' }}>
            {run.status === "completed" ? "Completed" : `Step ${currentStep} of ${totalSteps}`}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>
            {Math.round(progress)}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progress}%`,
              background: run.status === "completed" 
                ? 'var(--success)' 
                : 'var(--accent)'
            }}
          />
        </div>
        
        {/* Current step name */}
        {run.status === "running" && currentStep > 0 && currentStep <= stepNames.length && (
          <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', color: 'var(--accent)' }}>
            {stepNames[currentStep - 1]}
          </div>
        )}
      </div>
    );
  };

  return (
    <ClientConvexProvision>
      <div style={{ minHeight: '100vh' }}>
        {/* Top toolbar with only primary actions */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            borderBottom: '1px solid var(--border)',
            background: 'var(--background)'
          }}
        >
          <div className="container" style={{ padding: '1.5rem' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Dope DB Admin
              </h1>
              <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowWorkflowMenu((v) => !v)}
                    disabled={runningWorkflow}
                    className="btn btn-primary"
                    style={{ opacity: runningWorkflow ? 0.5 : 1 }}
                  >
                    {runningWorkflow ? (
                      <>
                        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                        {workflowStatus}
                      </>
                    ) : (
                      '🚀 Run New Workflow'
                    )}
                  </button>
                  {showWorkflowMenu && !runningWorkflow && (
                    <div
                      className="card"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        width: '16rem',
                        padding: '0.5rem',
                        zIndex: 40,
                      }}
                      role="menu"
                      aria-label="Select workflow to run"
                    >
                      <button
                        className="btn"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '0.875rem',
                          padding: '0.5rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setShowWorkflowMenu(false);
                          openClientModal();
                        }}
                      >
                        📈 Analysis Workflow
                      </button>
                    </div>
                  )}
                </div>

              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem' }}
                  onClick={() => setShowActionsMenu((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={showActionsMenu}
                >
                  ☰ Menu
                </button>
                {showActionsMenu && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      width: '14rem',
                      padding: '0.5rem',
                      zIndex: 40,
                    }}
                    role="menu"
                  >
                    <button
                      onClick={() => {
                        setShowActionsMenu(false);
                        void handleSignOut();
                      }}
                      className="btn"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.875rem',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: '1rem' }}>
          {/* User info section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Workflow Runs
            </h2>
            <div className="row" style={{ justifyContent: 'flex-start', gap: '0.75rem', alignItems: 'center' }}>
              {currentUser && (
                <div className="badge" style={{ 
                  fontSize: '0.6875rem', 
                  padding: '0.25rem 0.5rem',
                  background: 'var(--accent)',
                  color: 'white'
                }}>
                  {currentUser.name || currentUser.email || 'User'}
                </div>
              )}
              {currentUser?.name && currentUser.name !== currentUser.email && (
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
                  {currentUser.email}
                </p>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '1rem'
          }}>
            {/* Workflow Runs List */}
            <div className="card">
              {workflowRuns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                    No workflow runs yet. Click &quot;Run New Workflow&quot; to get started!
                  </p>
                </div>
              ) : (
                <div className="stack" style={{ gap: '0.5rem' }}>
                  {workflowRuns.map((run) => {
                    const currentStep = run.metadata?.currentStep || 0;
                    const totalSteps = run.metadata?.totalSteps || 5;
                    const progress = (currentStep / totalSteps) * 100;
                    const isSelected = selectedRun?.workflowRunId === run.workflowRunId;
                    
                    return (
                      <div
                        key={run.workflowRunId}
                        className="card"
                        style={{
                          padding: '0.75rem',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          background: run.status === "running" 
                            ? `linear-gradient(90deg, rgba(99, 102, 241, 0.05) ${progress}%, var(--card-bg) ${progress}%)`
                            : run.status === "completed"
                            ? 'var(--card-bg)'
                            : 'var(--card-bg)',
                          cursor: 'pointer'
                        }}
                      >
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div 
                          onClick={() => handleRunSelect(run)}
                          style={{ flex: 1 }}
                        >
                          <h3 style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.125rem' }}>
                            {run.title}
                          </h3>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>
                            {formatTimestamp(run.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkflow(run.workflowRunId);
                          }}
                          className="btn-danger"
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            border: 'none',
                            background: 'transparent'
                          }}
                          title="Delete workflow run"
                        >
                          🗑️
                        </button>
                      </div>
                      <div 
                        onClick={() => handleRunSelect(run)}
                        style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}
                      >
                        <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className={run.status === "completed" ? "badge badge-success" : run.status === "running" ? "badge badge-running" : "badge"}>
                            {run.status}
                          </span>
                          {run.clientName && <span className="badge">{run.clientName}</span>}
                        </div>
                      </div>
                      
                      {/* Progress Indicator */}
                      <ProgressIndicator run={run} />
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Workflow Results */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>
                Workflow Results
              </h2>
              
              {!selectedRun ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                    Select a workflow run to view its results
                  </p>
                </div>
              ) : workflowResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                    No results found for this workflow run
                  </p>
                </div>
              ) : (
                <div className="stack">
                  {workflowResults
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((result) => {
                      const isExpanded = expandedSteps.has(result.stepNumber);
                      
                      return (
                        <div
                          key={result._id}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Collapsible Header */}
                          <div 
                            onClick={() => toggleStepExpansion(result.stepNumber)}
                            style={{
                              padding: '0.75rem',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div className="row" style={{ justifyContent: 'space-between' }}>
                              <div className="row" style={{ gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted)' }}>
                                  Step {result.stepNumber}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>•</span>
                                <h3 style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)' }}>
                                  {result.stepTitle}
                                </h3>
                              </div>
                              <div className="row" style={{ gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>
                                  {formatTimestamp(result.timestamp)}
                                </span>
                                <div style={{ fontSize: '0.625rem', color: 'var(--muted)' }}>
                                  {isExpanded ? '▼' : '▶'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Collapsible Content */}
                          {isExpanded && (
                            <div style={{
                              padding: '0 0.75rem 0.75rem 0.75rem',
                              borderTop: '1px solid var(--border)'
                            }}>
                              <div style={{ 
                                background: 'var(--background)',
                                borderRadius: 'calc(var(--radius) - 0.125rem)',
                                padding: '0.75rem',
                                fontSize: '0.75rem',
                                whiteSpace: 'pre-wrap',
                                marginTop: '0.75rem',
                                color: 'var(--foreground)',
                                lineHeight: 1.6
                              }}>
                                {result.response}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
                  {/* Chat with Results Button */}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Name Modal */}
      {showClientModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="card" style={{ width: '24rem', maxWidth: 'calc(100vw - 2rem)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Run Analysis Workflow
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
              Enter the client name for this workflow run.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              Note: The client name must EXACTLY match the name in Dope data. If you&apos;re unsure of the exact name, please contact an account manager to confirm. You can also verify after running by reviewing the results.
            </p>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., ABC Construction Company"
              style={{ width: '100%', marginBottom: '1rem' }}
              onKeyPress={(e) => e.key === 'Enter' && runNewWorkflow()}
              autoFocus
            />
            <div className="row" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={closeClientModal}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={runNewWorkflow}
                disabled={!clientName.trim()}
                className="btn btn-primary"
                style={{ opacity: !clientName.trim() ? 0.5 : 1 }}
              >
                Start Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientConvexProvision>
  );
}
