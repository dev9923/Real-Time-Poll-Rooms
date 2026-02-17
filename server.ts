import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3010;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().catch(err => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
}).then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            // Log request for debugging
            console.log(`${req.method} ${req.url}`);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(server, {
        path: '/socket.io', // Explicit path
    });

    io.on('connection', (socket) => {
        // Join a poll room
        socket.on('joinPoll', (pollId) => {
            socket.join(`poll-${pollId}`);
        });

        // Leave a poll room
        socket.on('leavePoll', (pollId) => {
            socket.leave(`poll-${pollId}`);
        });
    });

    // Attach io to global so API routes can use it
    (global as any).io = io;

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
