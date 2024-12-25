import { AstraDBVectorStore } from "@langchain/community/vectorstores/astradb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
const endpoint = process.env.ASTRA_DB_API_ENDPOINT || "";
const token = process.env.ASTRA_DB_APPLICATION_TOKEN || "";
const collection = process.env.ASTRA_DB_COLLECTION || "embeddings";
if (!token || !endpoint) {
    throw new Error("Please set ASTRA_DB_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_COLLECTION");
}
export async function getVectorStore() {
    return AstraDBVectorStore.fromExistingIndex(new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }), {
        token,
        endpoint,
        collection,
        collectionOptions: {
            vector: {
                dimension: 1536,
                metric: "cosine",
            },
        },
    });
}
export function getEmbeddingsCollection() {
    // Create an instance of the `DataAPIClient` class with your token.
    const client = new DataAPIClient(token);
    // Get the database specified by your endpoint.
    const database = client.db(endpoint);
    console.log(`Connected to database ${database.id}`);
    return database.collection(collection);
}
