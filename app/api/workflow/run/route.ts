import { NextResponse } from 'next/server';
import { runAnalysisWorkflow } from "@/workflows/analysis-workflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, email, threadId, clientName } = body;

    // Run the analysis workflow
    const result = await runAnalysisWorkflow({
      userId: userId || "demo-user",
      userName: userName || "Demo User",
      email,
      threadId: threadId || null,
      clientName: clientName || "Unknown Client"
    });

    return NextResponse.json({
      success: true,
      workflowRunId: result.workflowRunId,
      finalOutput: result.finalOutput,
    });

  } catch (error: any) {
    console.error('Failed to run workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to run workflow'
      },
      { status: 500 }
    );
  }
}
