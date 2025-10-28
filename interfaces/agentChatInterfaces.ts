import z from "zod";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentName?: string;
  timestamp: Date;
  toolCalls?: Array<{
    name: string;
    arguments: any;
    result?: any;
  }>;
}

export interface ChatAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
}

export const ChatRequestSchema = z.object({
  message: z.string(),
  threadId: z.string().nullable().optional(),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  email: z.string().email().optional(),
});

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  agentName: z.string(),
  history: z.array(z.any()),
  threadId: z.string().optional(),
  lastAgentId: z.string().optional(),
  toolCalls: z
    .array(
      z.object({
        name: z.string(),
        arguments: z.any(),
        result: z.any().optional(),
      }),
    )
    .optional(),
});


