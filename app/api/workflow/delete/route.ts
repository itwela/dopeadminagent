import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { workflowRunId } = body;

    if (!workflowRunId) {
      return NextResponse.json({
        success: false,
        error: 'workflowRunId is required'
      }, { status: 400 });
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Delete all workflow results for this workflow run
    await convex.mutation(api.threads.deleteWorkflowResults, {
      workflowRunId
    });

    // Delete the workflow run record
    await convex.mutation(api.threads.deleteWorkflowRun, {
      workflowRunId
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow run deleted successfully'
    });

  } catch (error: any) {
    console.error('Failed to delete workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to delete workflow'
      },
      { status: 500 }
    );
  }
}
