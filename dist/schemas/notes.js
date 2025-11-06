"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotesSchema = exports.updateNoteSchema = exports.createNoteSchema = void 0;
const zod_1 = require("zod");
exports.createNoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(100).optional(),
    content: zod_1.z.string().min(1),
});
exports.updateNoteSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(100).optional(),
    content: zod_1.z.string().min(1).optional(),
}).refine((data) => !!data.title || !!data.content, {
    message: "Provide title or content to update",
    path: ["content"]
});
exports.listNotesSchema = zod_1.z.object({
    page: zod_1.z.preprocess(val => Number(val || 1), zod_1.z.number().int().min(1)).optional(),
    limit: zod_1.z.preprocess(val => Number(val || 10), zod_1.z.number().int().min(1).max(50)).optional(),
    search: zod_1.z.string().optional()
});
