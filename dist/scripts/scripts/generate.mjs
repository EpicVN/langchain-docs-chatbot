import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbeddingsCollection, getVectorStore } from "../lib/astradb";
async function generateEmbeddings() {
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
        // .replace(/^import.*$/gm, "")
        // // Remove export statements
        // .replace(/^export.*$/gm, "")
        // // Remove React component props
        // .replace(/ className=(["']).*?\1| className{.*?}/g, "")
        // // Remove other common React props
        // .replace(/ props={.*?}| {...props}/g, "")
        // // Remove JSX component tags
        // .replace(/<([A-Z][A-Za-z]+).*?>.*?<\/\1>/g, "")
        // // Remove self-closing JSX tags
        // .replace(/<([A-Z][A-Za-z]+).*?\/>/g, "")
        // // Remove empty lines
        // .replace(/^\s*[\r\n]/gm, "")
        // // Remove multiple consecutive empty lines
        // .replace(/\n\s*\n/g, "\n");
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
