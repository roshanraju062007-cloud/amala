/* EduSphere LMS — AI Assistant API Routes */
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Anthropic } = require('@anthropic-ai/sdk');

const router = express.Router();
router.use(authMiddleware);

// POST /ask — query the Claude AI model
router.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(503).json({
      success: false,
      message: 'AI assistant is not configured. Add ANTHROPIC_API_KEY to your .env file to enable it.'
    });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Use Claude-3-5-Sonnet or Claude-3-Haiku. Let's use Haiku as default for speed/cost.
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      system: 'You are the EduSphere School Assistant for Amala Higher Secondary School. ' +
              'Your role is to help students, teachers, and administrators. ' +
              'You can generate curriculum-aligned quiz questions, question papers, break down homework concepts step-by-step, ' +
              'or explain study questions. Keep answers clear, encouraging, educational, and structured.',
      messages: [{ role: 'user', content: message.trim() }]
    });

    const reply = response.content[0].text;
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Claude API Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to generate response from AI engine: ' + err.message });
  }
});

module.exports = router;