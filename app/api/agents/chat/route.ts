import { getOrCreateThread, updateThreadConvex, StoredMessage } from "@/app/agentUtills/actions";
import { dopeAdminAgent } from "@/app/agentUtills/agents";
import { setCurrentThreadId } from "@/app/agentUtills/tools";
import { ChatRequestSchema } from "@/interfaces/agentChatInterfaces";
import {
  run,
  setDefaultOpenAIKey,
  user
} from '@openai/agents';
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from 'next/server';
import { api } from "../../../../convex/_generated/api";

setDefaultOpenAIKey(
  process.env.NODE_ENV === 'production'
    ? process.env.OPENAI_API_KEY!
    : process.env.NEXT_PUBLIC_OPENAI_API_KEY!
);

export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, threadId, agentId, userId, userName, email } = ChatRequestSchema.parse(body);

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    const { savedMessages, currentThreadId, conversationThread } = await getOrCreateThread(
      convex,
      threadId || null,
    );

    conversationThread.push(user(message));

    // Set the current thread ID so tools can access it
    setCurrentThreadId(currentThreadId);

    const result = await run(dopeAdminAgent, conversationThread, { maxTurns: 30 });

    const toolCalls: Array<{ name: string; arguments: any; result?: any }> = [];
    if (result.history) {
      const callResults = new Map<string, any>();
      for (const item of result.history) {
        if ((item as any).type === 'function_call_result') {
          callResults.set((item as any).callId, (item as any).output);
        }
      }
      for (const item of result.history) {
        if ((item as any).type === 'function_call') {
          const argsRaw = (item as any).arguments;
          toolCalls.push({
            name: (item as any).name,
            arguments: typeof argsRaw === 'string' ? JSON.parse(argsRaw) : argsRaw,
            result: callResults.get((item as any).callId),
          });
        }
      }
    }

    const finalOutput: string = (result as any).finalOutput || 'No response generated';

    const messagesToSave: StoredMessage[] = [
      ...savedMessages,
      { 
        role: 'user' as const, 
        content: message, 
        timestamp: Date.now(), 
        agentName: 'user' 
      },
      {
        role: 'assistant' as const,
        content: finalOutput,
        timestamp: Date.now(),
        agentName: (result as any).lastAgent?.name || dopeAdminAgent.name,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      },
    ];

    if (currentThreadId) {
      if (savedMessages.length === 0) {
        await convex.mutation(api.threads.createThread, {
          threadId: currentThreadId,
          userId,
          userName,
          email,
          agentId: agentId || dopeAdminAgent.name,
          title: 'New Chat',
          history: messagesToSave,
        });
      } else {
        await updateThreadConvex(convex, currentThreadId, agentId || dopeAdminAgent.name, messagesToSave);
      }
    }

    return NextResponse.json({
      success: true,
      message: finalOutput,
      agentName: (result as any).lastAgent?.name || dopeAdminAgent.name,
      history: messagesToSave,
      threadId: currentThreadId,
      lastAgentId: agentId || dopeAdminAgent.name,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error',
        message: 'Sorry, I encountered an error processing your request.',
        agentName: 'System',
        history: [],
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const agents = [
      {
        id: dopeAdminAgent.name,
        name: dopeAdminAgent.name,
        description: dopeAdminAgent.instructions,
        capabilities: dopeAdminAgent.tools.map((tool) => tool.name),
        tools: dopeAdminAgent.tools.map((tool) => tool.name),
      },
    ];
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch agents' }, { status: 500 });
  }
}


