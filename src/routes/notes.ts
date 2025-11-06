import { Router } from 'express';
import { createNote, getNotes, updateNote, deleteNote } from '../controllers/notes';

const router = Router();

router.post('/createNotes', createNote)
router.get('/getNotes/:id', getNotes)
router.put('/notes/:id', updateNote)
router.delete('/notes/:id', deleteNote)

export default router
