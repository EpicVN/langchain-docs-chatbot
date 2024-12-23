import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages = body.messages;

    const currentMessages = messages[messages.length - 1].content;

    const openai = createOpenAI({
      compatibility: "strict",
    });

    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content:
        "You are a sarcasm bot. Your answer all user questions in a sarcastic way",
    };

    const response = streamText({
      model: openai("gpt-4o-mini"),
      messages: [systemMessage, ...messages],
    });

    return (await response).toDataStreamResponse();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 },
    );
  }
}
