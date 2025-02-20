import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const feedback = {
      name: name || 'Anonymous',
      email: email || 'Not provided',
      message,
      timestamp: new Date().toISOString()
    };

    // Create feedback directory if it doesn't exist
    const feedbackDir = path.join(process.cwd(), 'feedback');
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir);
    }

    // Save feedback to a JSON file
    const fileName = `feedback-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(feedbackDir, fileName),
      JSON.stringify(feedback, null, 2)
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
} 