import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbeddingsCollection, getVectorStore } from "../lib/astradb";
import { Redis } from "@upstash/redis";
async function generateEmbeddings() {
    await Redis.fromEnv().flushdb();
    const vectorStores = await getVectorStore();
    (await getEmbeddingsCollection()).deleteMany({});
    const loader = new DirectoryLoader("contents/docs/", {
        ".mdx": (path) => new TextLoader(path),
    }, true);
    const docs = (await loader.load())
        .filter((doc) => doc.metadata.source.endsWith("index.mdx"))
        .map((doc) => {
        const url = doc.metadata.source
            .replace(/\\/g, "/")
            .split("/contents/docs")[1]
            .split("/index")[0] || "/";
        const pageContentTrimmed = doc.pageContent;
        // .replace(/-\s*/g, "") // Remove hyphens followed by spaces
        // .replace(/\*\*/g, "") // Remove double asterisks
        // .replace(/__+/g, "") // Remove double underscores
        // .replace(/`+/g, "") // Remove backticks
        // .replace(/#+\s*/g, "") // Remove hash symbols followed by spaces (headers)
        // .replace(/\[.*?\]\(.*?\)/g, "") // Remove markdown links
        // .replace(/!\[.*?\]\(.*?\)/g, ""); // Remove markdown images
        return {
            pageContent: pageContentTrimmed,
            metadata: { url },
        };
    });
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: [
            "\n## ",
            "\n### ",
            "\n#### ",
            "\n##### ",
            "\n# ",
            "\n",
            " ",
            "",
        ],
    });
    const splitDocs = await splitter.splitDocuments(docs);
    await vectorStores.addDocuments(splitDocs);
}
generateEmbeddings();
