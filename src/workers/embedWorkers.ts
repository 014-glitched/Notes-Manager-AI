import IORedis from "ioredis"
import { Worker } from "bullmq"
import { EmbeddingJobPayload } from "../queue/types"
import prisma from "../config/prisma"

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379")

const worker = new Worker(
    "embeddingQueue",
    async (job) => {
        const data = job.data as EmbeddingJobPayload

        const embedding = await embedText(data.chunkText)

        await prisma.$executeRawUnsafe(
            `
            UPDATE "NoteChunk"
            SET embedding = $1
            WHERE id = $2
            `,
            embedding,
            data.chunkId
        )
    },
    { connection }
)

worker.on("completed", (job) => {
  console.log(`✅ Embedding job done for chunk: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Embedding job failed: ${job?.id}`, err);
});