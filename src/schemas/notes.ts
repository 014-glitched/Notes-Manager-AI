import { z } from "zod";

export const createNoteSchema = z.object ({
    title: z.string().min(2).max(100).optional(),
    content: z.string().min(1),
})

export const updateNoteSchema = z.object ({
    title: z.string().min(2).max(100).optional(),
    content: z.string().min(1).optional(),
}).refine((data) => !!data.title || !!data.content , {
    message: "Provide title or content to update",
    path: ["content"]
})

export const listNotesSchema = z.object ({
    page: z.preprocess(val => Number(val || 1), z.number().int().min(1)).optional(),
    limit: z.preprocess(val => Number(val || 10), z.number().int().min(1).max(50)).optional(),
    search: z.string().optional()
})