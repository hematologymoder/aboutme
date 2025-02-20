import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messageData = {
      message,
      timestamp: new Date().toISOString()
    };

    // Create messages directory if it doesn't exist
    const messagesDir = path.join(process.cwd(), 'messages');
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir);
    }

    // Save message to a JSON file
    const fileName = `message-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(messagesDir, fileName),
      JSON.stringify(messageData, null, 2)
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
} 