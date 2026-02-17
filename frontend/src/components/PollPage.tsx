import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust URL as needed

const PollPage = () => {
    const [pollData, setPollData] = useState(null);
    const [vote, setVote] = useState(null);
    const [results, setResults] = useState({});

    useEffect(() => {
        socket.on('poll', (data) => {
            setPollData(data);
        });

        socket.on('results', (data) => {
            setResults(data);
        });

        return () => {
            socket.off('poll');
            socket.off('results');
        };
    }, []);

    const handleVote = (option) => {
        setVote(option);
        socket.emit('vote', option);
    };

    if (!pollData) return <div>Loading...</div>;

    return (
        <div>
            <h1>{pollData.question}</h1>
            <div>
                {pollData.options.map((option, index) => (
                    <button key={index} onClick={() => handleVote(option)}>{option}</button>
                ))}
            </div>
            <div>
                <h2>Results:</h2>
                <ul>
                    {Object.entries(results).map(([option, count]) => (
                        <li key={option}>{option}: {count} votes</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PollPage;