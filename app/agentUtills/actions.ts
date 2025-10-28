import { ConvexHttpClient } from "convex/browser";
import { AgentInputItem } from "@openai/agents";
import { api } from "@/convex/_generated/api";
import { user } from "@openai/agents";
// No zod needed here

// const ChatRequestSchema = z.object({
//     message: z.string(),
//     threadId: z.string().nullable().optional(),
//     agentId: z.string().optional(),
//     userId: z.string().optional(),
//     userName: z.string().optional(),
// }); 

export type StoredMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    agentName?: string;
    toolCalls?: Array<{
        name: string;
        arguments: any;
        result?: any;
    }>;
};

const extractContent = (content: unknown): string => {
    if (typeof content === 'string') return content;
    if (content == null) return '';
    if (Array.isArray(content)) {
      return content
        .map((c) => {
            if (typeof c === 'string') return c;
            if (c && typeof c === 'object') {
                const obj = c as Record<string, unknown>;
                const t = obj.text;
                const cnt = obj.content;
                if (typeof t === 'string') return t;
                if (typeof cnt === 'string') return cnt;
                try { return JSON.stringify(c); } catch { return ''; }
            }
            return String(c);
        })
        .join(' ');
    }
    if (typeof content === 'object') {
      const obj = content as Record<string, unknown>;
      const t = obj.text;
      const cnt = obj.content;
      if (typeof t === 'string') return t;
      if (typeof cnt === 'string') return cnt;
      try { return JSON.stringify(content); } catch { return ''; }
    }
    return String(content);
};

const convertAgentHistoryToConvexFormat = (history: AgentInputItem[]): StoredMessage[] => {
    return history.map((item, index) => {
        const role = (item as unknown as { role?: StoredMessage['role'] }).role || 'system';
        const content = extractContent((item as unknown as { content?: unknown }).content);
        
        return {
            role,
            content,
            timestamp: Date.now() + index, // Add index to ensure unique timestamps
            agentName: (item as unknown as { agentName?: string }).agentName || (role === 'user' ? 'user' : 'assistant'),
        };
    });
};
  
const getOrCreateThread = async (convex: ConvexHttpClient, threadId: string | null): Promise<{ savedMessages: StoredMessage[]; currentThreadId: string; conversationThread: AgentInputItem[]; }> => {
let savedMessages: StoredMessage[] = [];
let currentThreadId: string = threadId || '';

if (currentThreadId) {
    const existingThread = await convex.query(api.threads.getThread, {
    threadId: currentThreadId,
    });
    if (existingThread) {
    savedMessages = (existingThread.history as StoredMessage[]) || [];
    }
} else {
    currentThreadId = `thread_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

const conversationThread: AgentInputItem[] = [];
for (const msg of savedMessages) {
    if (msg.role === 'user') {
    conversationThread.push(user(extractContent(msg.content)));
    } else if (msg.role === 'assistant') {
    conversationThread.push({
        role: 'system',
        content: `Previous assistant response: ${extractContent(msg.content)}`,
    } as AgentInputItem);
    }
}

return { savedMessages, currentThreadId, conversationThread };
};
  
const updateThreadConvex = async (
convex: ConvexHttpClient,
threadId: string,
agentId: string,
history: AgentInputItem[] | StoredMessage[],
): Promise<void> => {
// Convert agent history to Convex format when needed
const needsConversion = Array.isArray(history) && history.length > 0 && !('timestamp' in (history as unknown as Record<string, unknown>[])[0]);
const formattedHistory: StoredMessage[] = needsConversion
    ? convertAgentHistoryToConvexFormat(history as AgentInputItem[])
    : (history as StoredMessage[]);

// Check if thread exists first
const existingThread = await convex.query(api.threads.getThread, {
    threadId,
});

if (existingThread) {
    // Thread exists, update it
    await convex.mutation(api.threads.updateThread, {
        threadId,
        agentId,
        history: formattedHistory as unknown as Array<Record<string, unknown>>,
    });
} else {
    // Thread doesn't exist, create it
    await convex.mutation(api.threads.createThread, {
        threadId,
        userId: "system",
        userName: "Analysis Workflow",
        agentId,
        title: "Analysis Workflow",
        history: formattedHistory as unknown as Array<Record<string, unknown>>,
    });
}
};

const initializeConvexClient = () => {
    return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
};
  
export { initializeConvexClient };
export { extractContent, getOrCreateThread, updateThreadConvex, convertAgentHistoryToConvexFormat };