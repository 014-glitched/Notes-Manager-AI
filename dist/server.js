"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const prisma_1 = require("./config/prisma");
const auth_2 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const PORT = process.env.PORT || 3000;
async function startServer() {
    const dbConnected = await (0, prisma_1.testDBConnection)();
    if (!dbConnected) {
        console.error('Failed to connect to database. Server may not work properly.');
    }
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
startServer();
app.use('/api/auth', auth_1.default);
app.use('/api/notes', auth_2.requireAuth, notes_1.default);
app.get('/me', auth_2.requireAuth, (req, res) => {
    res.json({
        message: `Hello user ${req.user?.id}, you have accessed a protected route!`,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
