import Twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'No message provided' });
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Missing Twilio credentials');
    }

    const client = new Twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: process.env.MY_CELL_NUMBER,
    });
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Twilio Error:', err);
    return res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
}

