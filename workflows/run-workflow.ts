#!/usr/bin/env tsx

/**
 * Simple script to run the analysis workflow
 * Usage: npx tsx workflows/run-workflow.ts
 */

import { runAnalysisWorkflow } from './analysis-workflow';

async function main() {
  console.log('🚀 Starting Analysis Workflow...\n');
  
  const result = await runAnalysisWorkflow({
    userId: 'cli-user',
    userName: 'CLI User',
    threadId: null
  });

  if (result.success) {
    console.log('\n🎉 Workflow completed successfully!');
    console.log(`📋 Workflow Run ID: ${result.workflowRunId}`);
    console.log(`📊 Steps completed: ${result.stepResults.length}`);
    console.log('\n📄 Final Output:');
    console.log('=' .repeat(80));
    console.log(result.finalOutput);
    console.log('=' .repeat(80));
  } else {
    console.error('\n❌ Workflow failed:', result.error);
    process.exit(1);
  }
}

// Run the workflow
main().catch(console.error);
