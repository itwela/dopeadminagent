import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getThread = query({
  args: { threadId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("conversationThreads"),
      _creationTime: v.number(),
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
    email: v.optional(v.string()),
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
      email: args.email,
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

export const updateThread = mutation({
  args: {
    threadId: v.string(),
    agentId: v.optional(v.string()),
    title: v.optional(v.string()),
    projectId: v.optional(v.string()),
    history: v.array(v.any()),
  },
  returns: v.id("conversationThreads"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversationThreads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();
    if (!existing) {
      throw new Error("Thread not found");
    }
    await ctx.db.patch(existing._id, {
      agentId: args.agentId ?? existing.agentId,
      title: args.title ?? existing.title,
      projectId: args.projectId ?? existing.projectId,
      history: args.history,
      lastUpdated: Date.now(),
    });
    return existing._id;
  },
});

export const getUserThreads = query({
  args: { userId: v.optional(v.string()), userName: v.optional(v.string()), email: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("conversationThreads"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    if (args.email) {
      return await ctx.db
        .query("conversationThreads")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .order("desc")
        .collect();
    } else if (args.userName) {
      return await ctx.db
        .query("conversationThreads")
        .withIndex("by_user_name", (q) => q.eq("userName", args.userName))
        .order("desc")
        .collect();
    } else if (args.userId) {
      return await ctx.db
        .query("conversationThreads")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }
    return [];
  },
});

export const deleteThread = mutation({
  args: { threadId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const thread = await ctx.db
      .query("conversationThreads")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .first();
    if (thread) {
      await ctx.db.delete(thread._id);
      return true;
    }
    return false;
  },
});

export const getRecentThreads = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id("conversationThreads"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const threads = await ctx.db
      .query("conversationThreads")
      .order("desc")
      .take(limit);
    return threads;
  },
});

// Workflow Results Functions =================================================

export const saveWorkflowResult = mutation({
  args: {
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
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
      // store email in metadata for results for convenience
      metadata: { ...(args.metadata || {}), email: args.email },
      stepNumber: args.stepNumber,
      agentName: args.agentName,
      stepTitle: args.stepTitle,
      response: args.response,
      timestamp: now,
      threadId: args.threadId,
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

export const getUserWorkflowResults = query({
  args: { 
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
    limit: v.optional(v.number())
  },
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
    const limit = args.limit ?? 50;
    
    if (args.email) {
      // results don't have an email index; filter by metadata.email
      const byRun = await ctx.db
        .query("workflowResults")
        .order("desc")
        .take(limit * 5);
      return byRun.filter(r => (r.metadata as any)?.email === args.email).slice(0, limit);
    } else 
    if (args.userName) {
      return await ctx.db
        .query("workflowResults")
        .withIndex("by_user_name", (q) => q.eq("userName", args.userName))
        .order("desc")
        .take(limit);
    } else if (args.userId) {
      return await ctx.db
        .query("workflowResults")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }
    return [];
  },
});


export const deleteWorkflowResults = mutation({
  args: { workflowRunId: v.string() },
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("workflowResults")
      .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
      .collect();
    
    for (const result of results) {
      await ctx.db.delete(result._id);
    }
    
    return { deleted: results.length };
  },
});

// Workflow Runs Functions
export const createWorkflowRun = mutation({
  args: {
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
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
      email: args.email,
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

export const updateWorkflowRun = mutation({
  args: {
    workflowRunId: v.string(),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const workflowRun = await ctx.db
      .query("workflowRuns")
      .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
      .first();
    
    if (!workflowRun) {
      throw new Error("Workflow run not found");
    }
    
    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.status !== undefined) updates.status = args.status;
    if (args.completedAt !== undefined) updates.completedAt = args.completedAt;
    if (args.metadata !== undefined) updates.metadata = args.metadata;
    
    await ctx.db.patch(workflowRun._id, updates);
    return { success: true };
  },
});

export const getWorkflowRun = query({
  args: { workflowRunId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("workflowRuns"),
      _creationTime: v.number(),
      workflowRunId: v.string(),
      userId: v.optional(v.string()),
      userName: v.optional(v.string()),
      email: v.optional(v.string()),
      title: v.string(),
      clientName: v.optional(v.string()),
      threadId: v.optional(v.string()),
      status: v.string(),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
      metadata: v.optional(v.any()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const workflowRun = await ctx.db
      .query("workflowRuns")
      .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
      .first();
    return workflowRun;
  },
});

export const getWorkflowRunsForUser = query({
  args: { 
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  returns: v.array(v.object({
    _id: v.id("workflowRuns"),
    _creationTime: v.number(),
    workflowRunId: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    email: v.optional(v.string()),
    title: v.string(),
    clientName: v.optional(v.string()),
    threadId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    if (args.email) {
      return await ctx.db
        .query("workflowRuns")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .order("desc")
        .take(limit);
    }
    if (args.userName) {
      return await ctx.db
        .query("workflowRuns")
        .withIndex("by_user_name", (q) => q.eq("userName", args.userName))
        .order("desc")
        .take(limit);
    }
    return [];
  },
});

export const deleteWorkflowRun = mutation({
  args: { workflowRunId: v.string() },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const workflowRun = await ctx.db
      .query("workflowRuns")
      .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
      .first();
    
    if (workflowRun) {
      await ctx.db.delete(workflowRun._id);
    }
    
    return { success: true };
  },
});

// Create a thread from workflow results (or return existing one)
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
      
      console.log('[createThreadFromWorkflow] Found workflow run, checking for existing thread');
      
      // Check if a thread already exists for this workflow
      const existingThreadId = workflowRun.threadId;
      if (existingThreadId) {
        console.log('[createThreadFromWorkflow] Existing thread ID found:', existingThreadId);
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
        } else {
          console.log('[createThreadFromWorkflow] Thread ID exists but thread not found, will create new');
        }
      }
      
      console.log('[createThreadFromWorkflow] Fetching workflow results');
      
      // Get all workflow results
      const results = await ctx.db
        .query("workflowResults")
        .withIndex("by_workflow_run_id", (q) => q.eq("workflowRunId", args.workflowRunId))
        .order("asc")
        .collect();
      
      if (results.length === 0) {
        console.error('[createThreadFromWorkflow] No workflow results found');
        throw new Error("No workflow results found");
      }
      
      console.log(`[createThreadFromWorkflow] Found ${results.length} workflow results, building context`);
      
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
      
      console.log(`[createThreadFromWorkflow] Context message size: ${contextMessage.length} characters`);
      
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
      
      console.log('[createThreadFromWorkflow] Inserting new thread');
      
      await ctx.db.insert("conversationThreads", {
        threadId,
        userId: args.userId,
        userName: args.userName,
        agentId: 'db-admin-agent',
        title: `Chat: ${workflowRun.title}`,
        history,
        lastUpdated: now,
        createdAt: now,
      });
      
      console.log('[createThreadFromWorkflow] Linking thread to workflow run');
      
      // Link the thread back to the workflow run
      await ctx.db.patch(workflowRun._id, {
        threadId,
      });
      
      console.log('[createThreadFromWorkflow] Success!');
      
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


