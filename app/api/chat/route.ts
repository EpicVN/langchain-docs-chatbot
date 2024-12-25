import { getVectorStore } from "@/lib/astradb";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter, Message } from "ai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      messages,
    }: {
      messages: Message[];
    } = await req.json();

    const currentMessageContent = messages[messages.length - 1].content;

    console.log("Current message: ", currentMessageContent);

    const chatHistory = messages
      .slice(0, -1)
      .map((m: Message) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      );

    console.log("Chat History: ", chatHistory);

    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      streaming: true,
      verbose: true,
      cache: true
    });

    const rephrasingModel = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      verbose: true,
    });

    const retriever = (await getVectorStore()).asRetriever({
      k: 5, // tim 5 ket qua gan nhat (mac dinh la 4)
    });

    const rephrasePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      [
        "user",
        "Give the above conversation, generate a search query to look up in order to get information relevant to the current question. " +
          "Dont't leave out any relevant keywords. Only return the query and no other text",
      ],
    ]);

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: rephrasingModel,
      retriever: retriever,
      rephrasePrompt: rephrasePrompt,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a chatbot for a documents website. You impersonate the website's owner. " +
          "Answer the user's questions based on the below context. " +
          "Whenever it makes sense, provide links to pages that contain more information about the topic from the given context. " +
          "Format your messages in markdown format.\n\n" +
          "Context: \n{context}",
      ],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);

    // Add streaming callbacks
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const streamingModel = model.withConfig({
      callbacks: [
        {
          async handleLLMNewToken(token) {
            await writer.write(token);
          },
          async handleLLMEnd() {
            await writer.close();
          },
        },
      ],
    });

    const combineDocsChain = await createStuffDocumentsChain({
      llm: streamingModel,
      prompt,
      documentPrompt: PromptTemplate.fromTemplate(
        "Page URL: http://localhost:3000/docs{url}" +
          "\n\nPage content:\n{page_content}",
      ),
      documentSeparator: "\n---------------------------------\n",
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: combineDocsChain,
      retriever: historyAwareRetrieverChain,
    });

    const response = await retrievalChain.invoke({
      input: currentMessageContent,
      chat_history: chatHistory,
    });

    console.log("Chain response:");
    console.log(response.answer);
    console.log(
      `Number of used source document chunks: ${response.context.length}`,
    );

    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(response.answer);
        controller.close();
      },
    });

    return LangChainAdapter.toDataStreamResponse(readableStream);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 },
    );
  }
}
