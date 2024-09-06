import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Set Content Security Policy header
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; connect-src 'self' https://promptt-lemon.vercel.app"
    );
    next();
});

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
        console.error('Error communicating with OpenAI:', error.message || 'Unknown error');

        if (error.response) {
            const { status, data } = error.response;
            if (status === 429) {
                res.status(429).json({
                    error: 'Rate limit exceeded or quota reached. Please check your API usage and billing details.',
                    details: data,
                });
            } else {
                res.status(status || 500).json({
                    error: 'Error communicating with OpenAI',
                    details: data,
                });
            }
        } else {
            res.status(500).json({
                error: 'Error communicating with OpenAI',
                details: error.message || 'Unknown error',
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
