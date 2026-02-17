import React, { useState } from 'react';

const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['']);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic for submitting poll data goes here
        console.log({ question, options });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Poll Question:</label>
                <input 
                    type="text" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>Options:</label>
                {options.map((option, index) => (
                    <input 
                        key={index} 
                        type="text" 
                        value={option} 
                        onChange={(e) => handleOptionChange(index, e.target.value)} 
                        required 
                    />
                ))}
                <button type="button" onClick={addOption}>Add Option</button>
            </div>
            <button type="submit">Create Poll</button>
        </form>
    );
};

export default CreatePoll;