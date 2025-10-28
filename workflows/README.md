# Workflows

This folder contains standalone workflow implementations that can be run directly without going through the API.

## Analysis Workflow

The analysis workflow runs a 3-step process:
1. **Context Builder**: Retrieves account information, CRM ID, and recent jobs
2. **Job Analyzer**: Analyzes job patterns and customer types
3. **Targeting Strategy Builder**: Creates targeting strategy for finding prospects

## Running Workflows

### Method 1: NPM Script
```bash
npm run workflow
```

### Method 2: Direct Execution
```bash
npx tsx workflows/run-workflow.ts
```

### Method 3: Programmatic Usage
```typescript
import { runAnalysisWorkflow } from './workflows/analysis-workflow';

const result = await runAnalysisWorkflow({
  userId: 'your-user-id',
  userName: 'Your Name',
  threadId: 'optional-thread-id'
});

console.log(result);
```

## Workflow Configuration

```typescript
interface WorkflowConfig {
  userId?: string;        // User ID (default: "workflow-user")
  userName?: string;      // User name (default: "Workflow User")
  threadId?: string | null; // Optional thread ID to continue existing conversation
}
```

## Workflow Result

```typescript
interface WorkflowResult {
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
  error?: string;
}
```

## Database Integration

All workflow results are automatically saved to the `workflowResults` table in Convex with:
- Unique workflow run ID for grouping
- Step-by-step results
- User information
- Timestamps and metadata

## Adding New Workflows

1. Create a new TypeScript file in this folder
2. Export a main function that returns a `WorkflowResult`
3. Add any necessary configuration interfaces
4. Update this README with usage instructions
