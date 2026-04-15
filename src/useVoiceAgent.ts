import { useCallback, useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

export type TranscriptEntry = {
  role: 'user' | 'assistant' | string;
  text: string;
  timestamp: number;
};

export function useVoiceAgent() {
  const room = useMemo(() => new Room(), []);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const handleAgentAction = useCallback((action: string, payload: unknown) => {
    console.log('Received custom action from agent:', action, payload);
  }, []);

  const sendHeartbeatAck = useCallback(
    async (timestamp: number) => {
      await room.localParticipant.publishData(
        new TextEncoder().encode(
          JSON.stringify({
            type: 'client_action',
            action: 'heartbeat_ack',
            payload: { timestamp }
          })
        ),
        { reliable: true, topic: 'client_actions' }
      );
    },
    [room]
  );

  useEffect(() => {
    const onTrackSubscribed = (track: Track) => {
      if (track.kind === Track.Kind.Audio) {
        const element = track.attach();
        element.setAttribute('data-agent-audio', 'true');
        document.body.appendChild(element);
      }
    };

    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => {
      setIsConnected(false);
      setIsMicEnabled(false);
    };

    const onDataReceived = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) => {
      if (topic !== 'client_actions') return;

      const data = JSON.parse(new TextDecoder().decode(payload));
      if (data.type !== 'client_action') return;

      if (data.action === 'heartbeat') {
        const ts = Number(data.payload?.timestamp);
        console.log('Heartbeat received from agent:', data.payload?.agent_identity);
        if (!Number.isNaN(ts)) {
          void sendHeartbeatAck(ts);
        }
        return;
      }

      if (data.action === 'send_transcript') {
        setTranscript((prev) => [...prev, data.payload as TranscriptEntry]);
        return;
      }

      handleAgentAction(data.action, data.payload);
    };

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.DataReceived, onDataReceived);

    return () => {
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.DataReceived, onDataReceived);
      void room.disconnect();
    };
  }, [handleAgentAction, room, sendHeartbeatAck]);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);

    try {
      const tokenResponse = await fetch('/api/voice-token');
      if (!tokenResponse.ok) {
        throw new Error(`Token endpoint failed with status ${tokenResponse.status}`);
      }

      const { livekit_url, token } = await tokenResponse.json();
      await room.connect(livekit_url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMicEnabled(true);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, room]);

  const disconnect = useCallback(async () => {
    await room.disconnect();
  }, [room]);

  const toggleMic = useCallback(async () => {
    const enabled = !isMicEnabled;
    await room.localParticipant.setMicrophoneEnabled(enabled);
    setIsMicEnabled(enabled);
  }, [isMicEnabled, room]);

  return {
    room,
    transcript,
    isConnected,
    isConnecting,
    isMicEnabled,
    connect,
    disconnect,
    toggleMic
  };
}
