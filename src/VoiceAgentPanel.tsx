import React from 'react';
import { useVoiceAgent } from './useVoiceAgent';

export function VoiceAgentPanel() {
  const {
    transcript,
    isConnected,
    isConnecting,
    isMicEnabled,
    connect,
    disconnect,
    toggleMic
  } = useVoiceAgent();

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Toddler Play Pal</h2>
      <p>Live voice agent powered by Vocal Bridge + LiveKit.</p>

      {!isConnected ? (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting…' : 'Start Voice Chat'}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleMic}>{isMicEnabled ? 'Mute' : 'Unmute'}</button>
          <button onClick={disconnect}>End Call</button>
        </div>
      )}

      <div
        id="transcript"
        style={{
          marginTop: 16,
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 12,
          minHeight: 180,
          maxHeight: 280,
          overflowY: 'auto',
          background: '#fafafa'
        }}
      >
        {transcript.length === 0 ? (
          <div style={{ color: '#666' }}>Transcript will appear here…</div>
        ) : (
          transcript.map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              style={{ textAlign: entry.role === 'user' ? 'right' : 'left', marginBottom: 6 }}
            >
              <strong>{entry.role === 'user' ? 'You' : 'Agent'}:</strong> {entry.text}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
