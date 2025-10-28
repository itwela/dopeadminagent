import { NextResponse } from 'next/server';
import { runAnalysisWorkflow } from "@/workflows/analysis-workflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, email, threadId, clientName } = body;

    console.log(`[Workflow API] Starting workflow for client: ${clientName}`);

    // Run the analysis workflow
    const result = await runAnalysisWorkflow({
      userId: userId || "demo-user",
      userName: userName || "Demo User",
      email,
      threadId: threadId || null,
      clientName: clientName || "Unknown Client"
    });

    // Check if workflow actually succeeded
    if (!result.success) {
      console.error('[Workflow API] Workflow failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Workflow failed without error message',
          workflowRunId: result.workflowRunId
        },
        { status: 500 }
      );
    }

    console.log(`[Workflow API] Workflow completed successfully: ${result.workflowRunId}`);
    return NextResponse.json({
      success: true,
      workflowRunId: result.workflowRunId,
      finalOutput: result.finalOutput,
      title: result.title
    });

  } catch (error: any) {
    console.error('[Workflow API] Exception running workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error) || 'Failed to run workflow'
      },
      { status: 500 }
    );
  }
}
