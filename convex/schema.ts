import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  // Conversation threads for agent chat
  conversationThreads: defineTable({
    threadId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
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
    .index("by_email", ["email"]) 
    .index("by_agent_id", ["agentId"]),

  // Optional projects table for organizing threads
  projects: defineTable({
    projectId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project_id", ["projectId"]) 
    .index("by_user_id", ["userId"]) 
    .index("by_user_name", ["userName"]),

  // Workflow runs table for storing workflow run metadata
  workflowRuns: defineTable({
    workflowRunId: v.string(), // Unique ID for the workflow run
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
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
    .index("by_email", ["email"])
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
