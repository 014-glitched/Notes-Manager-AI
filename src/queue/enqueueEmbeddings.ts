import { embeddingQueue } from "./queue";
import { EmbeddingJobPayload } from "./types";

export async function enqueueEmbeddingjob(job: EmbeddingJobPayload) {
    await embeddingQueue.add("embed-chunk", job, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
    })
}