import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export async function testDBConnection() {
    try{
        await prisma.$connect()
        console.log("Database connected")
        return true
    } catch (err){
        console.error("Database connection error:", err);
        return false
    }
}

export default prisma;