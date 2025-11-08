export function chunkNoteContent (
    text: string,
    chunkSize: number = 2000,
    overlap: number = 200
): string[] {
    if(!text || text.trim().length === 0) return []

    const cleaned = text.replace(/\s+/g, " ").trim();

    const chunks: string[] = []
    let start = 0

    while(start < cleaned.length){
        const end = Math.min(start + chunkSize, cleaned.length)
        const chunk = cleaned.slice(start, end)

        chunks.push(chunk)

        start = end - overlap;
        if (start < 0) start = 0;
    }
    return chunks
}
