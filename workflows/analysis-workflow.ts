import { ConvexHttpClient } from "convex/browser";
import { Runner, user } from "@openai/agents";
import { contextBuilderAgentCore, jobAnalyzerAgentCore, targetingStrategyAgentCore, findNewContactsAgentCore, titleGeneratorAgentCore } from "@/app/agentUtills/agents";
import { getOrCreateThread } from "@/app/agentUtills/actions";
import { api } from "@/convex/_generated/api";

export interface WorkflowConfig {
  userId?: string;
  userName?: string;
  email?: string;
  threadId?: string | null;
  clientName?: string;
}

export interface WorkflowResult {
  success: boolean;
  workflowRunId: string;
  finalOutput: string;
  stepResults: Array<{
    stepNumber: number;
    agentName: string;
    stepTitle: string;
    response: string;
    timestamp: number;
  }>;
  title?: string;
  error?: string;
}

export async function runBusinessAnalysisWorkflow(config: WorkflowConfig = {}): Promise<WorkflowResult> {
  const {
    userId = "workflow-user",
    userName = "Workflow User",
    email = undefined,
    threadId = null,
    clientName = "Unknown Client"
  } = config;

  try {
    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Generate unique workflow run ID
    const workflowRunId = `workflow_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Get or create thread
    const { conversationThread, currentThreadId } = await getOrCreateThread(convex, threadId);

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: 'analysis-workflow',
        workflow_id: workflowRunId,
      },
    });

    const history: any[] = [...conversationThread];
    const stepSections: string[] = [];
    const stepResults: WorkflowResult['stepResults'] = [];

    console.log(`🚀 Starting Analysis Workflow for ${clientName}: ${workflowRunId}`);

    // Create workflow run record immediately so it appears in UI
    await convex.mutation(api.threads.createWorkflowRun, {
      workflowRunId,
      userId,
      userName,
    email,
      title: `Analysis Workflow - ${clientName}`,
      clientName,
      threadId: currentThreadId || undefined,
      status: "running"
    });

    // Step 1: Context Builder
    console.log("📋 Step 1: Context Builder...");
    const contextMessage = user(`Please analyze the current conversation and retrieve account information, CRM ID, CRM connections, and recent jobs from the database for client: ${clientName}`);
    const historyWithContext = [...history, contextMessage];

    const step1 = await runner.run(contextBuilderAgentCore, historyWithContext);
    if (!step1.finalOutput) {
      throw new Error('Context builder failed to produce output');
    }
    
    history.push(...(step1.newItems || []).map((i: any) => i.rawItem));
    const step1Text = typeof step1.finalOutput === 'string' ? step1.finalOutput : JSON.stringify(step1.finalOutput);
    
    stepSections.push([
      `# 🗂️ Step 1: Context Builder Results - ${clientName}`,
      `**Client:** ${clientName}`,
      `**Generated:** ${new Date().toISOString()}`,
      '',
      step1Text,
    ].join('\n'));

    // Save step 1 result
    const step1Result = {
      stepNumber: 1,
      agentName: "Context Builder",
      stepTitle: `Context Builder - Account & CRM Analysis (${clientName})`,
      response: step1Text,
      timestamp: Date.now()
    };
    stepResults.push(step1Result);

    await convex.mutation(api.threads.saveWorkflowResult, {
      workflowRunId,
      userId,
      userName,
    email,
      stepNumber: 1,
      agentName: "Context Builder",
      stepTitle: `Context Builder - Account & CRM Analysis (${clientName})`,
      response: step1Text,
      threadId: currentThreadId || undefined,
      metadata: { timestamp: new Date().toISOString(), clientName }
    });

    // Update workflow run status
    await convex.mutation(api.threads.updateWorkflowRun, {
      workflowRunId,
      status: "running",
      metadata: { currentStep: 1, totalSteps: 5, clientName }
    });

    console.log("✅ Step 1 completed");

    // Step 2: Job Analyzer
    console.log("📊 Step 2: Job Analyzer...");
    const jobAnalyzerMessage = user(`Please analyze the job data provided in the previous step and extract patterns about the type of customers and work performed for client: ${clientName}`);
    const historyWithJobAnalysis = [...history, jobAnalyzerMessage];

    const step2 = await runner.run(jobAnalyzerAgentCore, historyWithJobAnalysis);
    if (!step2.finalOutput) {
      throw new Error('Job analyzer failed to produce output');
    }
    
    history.push(...(step2.newItems || []).map((i: any) => i.rawItem));
    const step2Text = typeof step2.finalOutput === 'string' ? step2.finalOutput : JSON.stringify(step2.finalOutput);
    
    stepSections.push([
      `# 📝 Step 2: Job Analyzer Results - ${clientName}`,
      `**Client:** ${clientName}`,
      `**Generated:** ${new Date().toISOString()}`,
      '',
      step2Text,
    ].join('\n'));

    // Save step 2 result
    const step2Result = {
      stepNumber: 2,
      agentName: "Job Analyzer",
      stepTitle: `Job Analyzer - Pattern Analysis (${clientName})`,
      response: step2Text,
      timestamp: Date.now()
    };
    stepResults.push(step2Result);

    await convex.mutation(api.threads.saveWorkflowResult, {
      workflowRunId,
      userId,
      userName,
    email,
      stepNumber: 2,
      agentName: "Job Analyzer",
      stepTitle: `Job Analyzer - Pattern Analysis (${clientName})`,
      response: step2Text,
      threadId: currentThreadId || undefined,
      metadata: { timestamp: new Date().toISOString(), clientName }
    });

    // Update workflow run status
    await convex.mutation(api.threads.updateWorkflowRun, {
      workflowRunId,
      status: "running",
      metadata: { currentStep: 2, totalSteps: 5, clientName }
    });

    console.log("✅ Step 2 completed");

    // Step 3: Targeting Strategy Builder
    console.log("🎯 Step 3: Targeting Strategy Builder...");
    const targetingMessage = user(`Based on the job analysis from the previous step, please create a targeting strategy for finding more prospects that match the analyzed job patterns for client: ${clientName}`);
    const historyWithTargeting = [...history, targetingMessage];

    const step3 = await runner.run(targetingStrategyAgentCore, historyWithTargeting);
    if (!step3.finalOutput) {
      throw new Error('Target strategy builder failed to produce output');
    }
    
    history.push(...(step3.newItems || []).map((i: any) => i.rawItem));
    const step3Text = typeof step3.finalOutput === 'string' ? step3.finalOutput : JSON.stringify(step3.finalOutput);
    
    stepSections.push([
      `# 🎯 Step 3: Target Strategy Builder Results - ${clientName}`,
      `**Client:** ${clientName}`,
      `**Generated:** ${new Date().toISOString()}`,
      '',
      step3Text,
    ].join('\n'));

    // Save step 3 result
    const step3Result = {
      stepNumber: 3,
      agentName: "Targeting Strategy Builder",
      stepTitle: `Targeting Strategy - Prospect Identification (${clientName})`,
      response: step3Text,
      timestamp: Date.now()
    };
    stepResults.push(step3Result);

    await convex.mutation(api.threads.saveWorkflowResult, {
      workflowRunId,
      userId,
      userName,
    email,
      stepNumber: 3,
      agentName: "Targeting Strategy Builder",
      stepTitle: `Targeting Strategy - Prospect Identification (${clientName})`,
      response: step3Text,
      threadId: currentThreadId || undefined,
      metadata: { timestamp: new Date().toISOString(), clientName }
    });

    // Update workflow run status
    await convex.mutation(api.threads.updateWorkflowRun, {
      workflowRunId,
      status: "running",
      metadata: { currentStep: 3, totalSteps: 5, clientName }
    });

    console.log("✅ Step 3 completed");

    // Step 4: Find New Contacts
    console.log("🔍 Step 4: Find New Contacts...");
    try {
      const findNewContactsMessage = user(`Please use the context and targeting strategy from the previous steps to find new contacts for the client: ${clientName}`);
      const historyWithFindNewContacts = [...history, findNewContactsMessage];

      console.log(`[Step 4] Running findNewContactsAgent for ${clientName}...`);
      const step4 = await runner.run(findNewContactsAgentCore, historyWithFindNewContacts, { maxTurns: 30 });
      
      if (!step4.finalOutput) {
        console.error('[Step 4] No final output from findNewContactsAgent');
        throw new Error('Find new contacts failed to produce output');
      }

      console.log(`[Step 4] Received output, processing...`);
      history.push(...(step4.newItems || []).map((i: any) => i.rawItem));
      const step4Text = typeof step4.finalOutput === 'string' ? step4.finalOutput : JSON.stringify(step4.finalOutput);
      
      stepSections.push([
        `# 🔍 Step 4: Find New Contacts Results - ${clientName}`,
        `**Client:** ${clientName}`,
        `**Generated:** ${new Date().toISOString()}`,
        '',
        step4Text,
      ].join('\n'));

      // Save step 4 result
      const step4Result = {
        stepNumber: 4,
        agentName: "Find New Contacts",
        stepTitle: `Find New Contacts - Property Search (${clientName})`,
        response: step4Text,
        timestamp: Date.now()
      };
      stepResults.push(step4Result);

      await convex.mutation(api.threads.saveWorkflowResult, {
        workflowRunId,
        userId,
        userName,
        email,
        stepNumber: 4,
        agentName: "Find New Contacts",
        stepTitle: `Find New Contacts - Property Search (${clientName})`,
        response: step4Text,
        threadId: currentThreadId || undefined,
        metadata: { timestamp: new Date().toISOString(), clientName }
      });

      // Update workflow run status
      await convex.mutation(api.threads.updateWorkflowRun, {
        workflowRunId,
        status: "running",
        metadata: { currentStep: 4, totalSteps: 5, clientName }
      });

      console.log("✅ Step 4 completed");
    } catch (step4Error: any) {
      console.error('[Step 4] ERROR:', step4Error);
      console.error('[Step 4] Error message:', step4Error?.message);
      console.error('[Step 4] Error stack:', step4Error?.stack);
      
      // Save error to database
      await convex.mutation(api.threads.updateWorkflowRun, {
        workflowRunId,
        status: "failed",
        metadata: { 
          currentStep: 4, 
          totalSteps: 5, 
          clientName,
          error: step4Error?.message || String(step4Error),
          errorStack: step4Error?.stack
        }
      });
      
      throw new Error(`Step 4 (Find New Contacts) failed: ${step4Error?.message || String(step4Error)}`);
    }

    // Step 5: Generate Title
    console.log("📝 Step 5: Generate Title...");
    const titleMessage = user(`Based on the workflow results for client "${clientName}", generate a concise, descriptive title for this workflow run. Include the client name and main purpose.`);
    const historyWithTitle = [...history, titleMessage];

    const step5 = await runner.run(titleGeneratorAgentCore, historyWithTitle);
    if (!step5.finalOutput) {
      throw new Error('Title generator failed to produce output');
    }

    const titleText = typeof step5.finalOutput === 'string' ? step5.finalOutput : JSON.stringify(step5.finalOutput);
    const generatedTitle = titleText.replace(/['"]/g, '').trim(); // Clean up quotes

    // Update workflow run with final title and completion status
    await convex.mutation(api.threads.updateWorkflowRun, {
      workflowRunId,
      title: generatedTitle,
      status: "completed",
      completedAt: Date.now(),
      metadata: { currentStep: 5, totalSteps: 5, clientName, completed: true }
    });

    const finalOutput = stepSections.join('\n\n');
    console.log(`🎉 Workflow completed: ${workflowRunId} - ${generatedTitle}`);

    return {
      success: true,
      workflowRunId,
      finalOutput,
      stepResults,
      title: generatedTitle
    };

  } catch (error: any) {
    console.error('[Workflow] FATAL ERROR:', error);
    console.error('[Workflow] Error message:', error?.message);
    console.error('[Workflow] Error stack:', error?.stack);
    
    // Generate workflow run ID if we don't have one yet
    const errorWorkflowRunId = `failed_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    
    try {
      // Try to create a failed workflow run record
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      await convex.mutation(api.threads.createWorkflowRun, {
        workflowRunId: errorWorkflowRunId,
        userId: userId || "error-user",
        userName: userName || "Error User",
        email: email,
        title: `Failed: ${clientName || "Unknown Client"}`,
        clientName: clientName || "Unknown Client",
        status: "failed",
        metadata: {
          error: error?.message || String(error),
          errorStack: error?.stack,
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      console.error('[Workflow] Failed to save error to database:', dbError);
    }
    
    return {
      success: false,
      workflowRunId: errorWorkflowRunId,
      finalOutput: '',
      stepResults: [],
      error: error?.message || String(error)
    };
  }
}

// Export a simple runner function for easy use
export async function runWorkflow(userId?: string, userName?: string, threadId?: string | null) {
  return runBusinessAnalysisWorkflow({ userId, userName, threadId });
}

// Backwards-compatible export name expected by API route
export const runAnalysisWorkflow = runBusinessAnalysisWorkflow;
