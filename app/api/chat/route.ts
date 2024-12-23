import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { streamText, LangChainAdapter, Message } from "ai";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { NextResponse } from "next/server";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const {
      messages,
    }: {
      messages: Message[];
    } = await req.json();

    const currentMessageContent = messages[messages.length - 1].content;

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a sarcasm bot. Your answer all user questions in a sarcastic way",
      ],
      ["user", "{input}"],
    ]);

    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      streaming: true,
    });

    const chain = prompt.pipe(model);

    const formattedMessages = messages.map((message) =>
      message.role === "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    );

    console.log("formattedMessages: ", formattedMessages);

    const stream = await chain.stream({
      history: formattedMessages,
      input: currentMessageContent,
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 },
    );
  }
}
