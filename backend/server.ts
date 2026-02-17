import WebSocket from 'ws';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

let polls = {};

// Create a new poll
app.post('/polls', (req, res) => {
    const { question, options } = req.body;
    const pollId = Date.now();  // Simple unique ID based on timestamp
    polls[pollId] = { question, options, votes: Array(options.length).fill(0) };
    res.status(201).send({ pollId });
    
    // Notify all connected clients about the new poll
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'newPoll', pollId, question, options }));
        }
    });
});

// Vote for a poll
app.post('/polls/:pollId/vote', (req, res) => {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    if (polls[pollId]) {
        polls[pollId].votes[optionIndex] += 1;
        res.sendStatus(200);
        
        // Notify all connected clients about the vote
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'vote', pollId, optionIndex }));
            }
        });
    } else {
        res.status(404).send('Poll not found');
    }
});

// Handle real-time WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
