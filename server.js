import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

// Endpoint to solve a JavaScript coding problem
app.post('/api/solve-js-problem', async (req, res) => {
    const { problemDescription } = req.body;

    if (!problemDescription) {
        return res.status(400).json({ error: 'Problem description is required' });
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: `Solve the following JavaScript problem:\n${problemDescription}` }],
            max_tokens: 2048,
            temperature: 1,
        });

        const openaiResponse = response.choices[0].message.content.trim();

        // Assuming OpenAI returns valid JavaScript code in response
        const formattedSolution = openaiResponse.replace(/\\/g, '');

        // Send formatted solution in the response
        res.json({
            solution: formattedSolution,
        });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 429) {
            res.status(429).json({
                error: 'Rate limit exceeded or quota reached. Please check your API usage and billing details.',
                details: error.response.data,
            });
        } else {
            res.status(500).json({
                error: 'Error communicating with OpenAI',
                details: error.response ? error.response.data : error.message,
            });
        }
    } finally {
        console.log('Request to OpenAI completed');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
