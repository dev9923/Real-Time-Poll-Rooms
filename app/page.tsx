'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        } else {
            setError('Maximum 10 options allowed.');
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title cannot be empty.');
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            setError('Please provide at least 2 valid options.');
            return;
        }

        try {
            const res = await fetch('/api/polls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, options: validOptions }),
            });

            if (!res.ok) {
                let errorMessage = 'Failed to create poll';
                const text = await res.text();
                try {
                    const errData = JSON.parse(text);
                    errorMessage = errData.error || errorMessage;
                } catch {
                    console.error('API Error Response:', text); // Log HTML for debugging
                    errorMessage = `Server Error: ${res.status} ${res.statusText}. Check console for details.`;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            router.push(`/polls/${data.id}`);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="container animate-fade-in">
            <div className="card glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', background: 'linear-gradient(to right, #2563eb, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Create Poll
                </h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--muted)' }}>
                    Ask a question and get real-time feedback.
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>
                            Question
                        </label>
                        <input
                            id="title"
                            className="input-field"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. What's the best framework?"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--foreground)' }}>
                            Options
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {options.map((opt, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        required={index < 2} // First two are required
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="btn-danger"
                                            title="Remove Option"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addOption}
                            className="btn-secondary"
                            style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <span>+</span> Add Another Option
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: '1rem' }}
                    >
                        Create Poll
                    </button>
                </form>
            </div>
        </div>
    );
}
