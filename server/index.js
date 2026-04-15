import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const VOCAL_BRIDGE_TOKEN_URL = 'http://vocalbridgeai.com/api/v1/token';

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'toddler-play-pal-token-service' });
});

app.get('/api/voice-token', async (req, res) => {
  const apiKey = process.env.VOCAL_BRIDGE_API_KEY;
  const agentId = process.env.VOCAL_BRIDGE_AGENT_ID;

  if (!apiKey) {
    res.status(500).json({
      error: 'Missing VOCAL_BRIDGE_API_KEY in environment variables.'
    });
    return;
  }

  const participantName = req.query.name?.toString() || 'User';

  const headers = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  };

  if (agentId) {
    headers['X-Agent-Id'] = agentId;
  }

  try {
    const response = await fetch(VOCAL_BRIDGE_TOKEN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ participant_name: participantName })
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: 'Vocal Bridge token request failed',
        details: data
      });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Unexpected failure requesting Vocal Bridge token',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Voice token backend listening on http://localhost:${port}`);
});
