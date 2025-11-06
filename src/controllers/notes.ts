import {Request, Response} from "express";
import prisma from "../config/prisma";
import {createNoteSchema, updateNoteSchema} from "../schemas/notes";
import {z} from "zod";


type AuthRequest = Request & {user?: {id: string}};

export async function createNote(req: AuthRequest, res: Response) {
  try {
    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: z.flattenError(parsed.error),
      });
    }

    const {title, content} = parsed.data;
    const userId = req.user?.id;

    console.log(`Creating note for user ${userId}, title: "${title}"`);

    const note = await prisma.note.create({
      data: {title, content, user: {connect: {id: userId}}},
    });

    console.log(`Note created successfully with ID: ${note.id}`);
    return res.status(201).json(note)

  } catch (err) {
    console.error("Error while creating note:", err);
    return res.status(500).json({error: "Internal Server Error"});
  }
}

export async function getNotes(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;
    const userId = req.user?.id;

    console.log(`Fetching note with ID: ${id} from database`);
    const note = await prisma.note.findUnique({where: {id}});
    
    if (!note) return res.status(404).json({error: "Note not found"});

    if (note.userId !== userId) {
      return res.status(403).json({error: "Access denied"});
    }
    return res.status(200).json(note);
  } catch (err) {
    console.error("Error while fetching note:", err);
    return res.status(500).json({error: "Internal Server Error"});
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    const parsed = updateNoteSchema.safeParse(req.body);
    console.log("Data body", parsed)

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: z.flattenError(parsed.error),
      });
    }
      const id = req.params.id
      const userId = req.user?.id

      const existing = await prisma.note.findUnique({ where: { id }})
      if(!existing){
        return res.status(404).json({ error: "Note not found" });
      }
      if(existing.userId !== userId){
        return res.status(403).json({ error: "Access denied" });
      }
      const data: any = {}
      if(parsed.data.title !== undefined) data.title = parsed.data.title
      if(parsed.data.content !== undefined) data.content = parsed.data.content

      const updated = await prisma.note.update({
        where: { id },
        data
      })

      return res.json(updated)
  } catch (err) {
    console.error("Error while updating note:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
    try{
        const id = req.params.id
        const userId = req.user?.id

        const existing = await prisma.note.findUnique({ where: { id }})
        if(!existing) return res.status(404).json({ error: "Note not found" });
        if(existing.userId !== userId){
            return res.status(403).json({ error: "Access denied" });
        }

        await prisma.note.delete({ where: { id }})
        return res.status(204).send()
    }catch (err){
        console.error("Error while deleting note:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
