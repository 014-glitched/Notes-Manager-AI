"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDBConnection = testDBConnection;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testDBConnection() {
    try {
        await prisma.$connect();
        console.log("Database connected");
        return true;
    }
    catch (err) {
        console.error("Database connection error:", err);
        return false;
    }
}
exports.default = prisma;
