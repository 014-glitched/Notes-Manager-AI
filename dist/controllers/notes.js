"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNote = createNote;
exports.getNotes = getNotes;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
const prisma_1 = __importDefault(require("../config/prisma"));
const notes_1 = require("../schemas/notes");
const zod_1 = require("zod");
async function createNote(req, res) {
    try {
        const parsed = notes_1.createNoteSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                details: zod_1.z.flattenError(parsed.error),
            });
        }
        const { title, content } = parsed.data;
        const userId = req.user?.id;
        const note = await prisma_1.default.note.create({
            data: { title, content, user: { connect: { id: userId } } },
        });
        return res.status(201).json(note);
    }
    catch (err) {
        console.error("Error while creating note:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
async function getNotes(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const note = await prisma_1.default.note.findUnique({ where: { id } });
        if (!note)
            return res.status(404).json({ error: "Note not found" });
        if (note.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        return res.status(200).json(note);
    }
    catch (err) {
        console.error("Error while fetching note:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
async function updateNote(req, res) {
    try {
        const parsed = notes_1.updateNoteSchema.safeParse(req.body);
        console.log("Data body", parsed);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                details: zod_1.z.flattenError(parsed.error),
            });
        }
        const id = req.params.id;
        const userId = req.user?.id;
        const existing = await prisma_1.default.note.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Note not found" });
        }
        if (existing.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const data = {};
        if (parsed.data.title !== undefined)
            data.title = parsed.data.title;
        if (parsed.data.content !== undefined)
            data.content = parsed.data.content;
        const updated = await prisma_1.default.note.update({
            where: { id },
            data
        });
        return res.json(updated);
    }
    catch (err) {
        console.error("Error while updating note:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
async function deleteNote(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const existing = await prisma_1.default.note.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: "Note not found" });
        if (existing.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        await prisma_1.default.note.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        console.error("Error while deleting note:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
