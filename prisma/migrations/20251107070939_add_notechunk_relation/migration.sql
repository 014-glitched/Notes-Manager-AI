-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable: add processing flag
ALTER TABLE "public"."Note" 
ADD COLUMN "processing" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: NoteChunk
CREATE TABLE "public"."NoteChunk" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embedding" vector,  -- now valid because extension is enabled
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteChunk_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "NoteChunk_userId_idx" ON "public"."NoteChunk"("userId");
CREATE INDEX "NoteChunk_noteId_idx" ON "public"."NoteChunk"("noteId");

-- Add foreign key
ALTER TABLE "public"."NoteChunk" 
ADD CONSTRAINT "NoteChunk_noteId_fkey" 
FOREIGN KEY ("noteId") REFERENCES "public"."Note"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
