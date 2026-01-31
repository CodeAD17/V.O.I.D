import React from 'react';

const MobileDocs: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 text-slate-300 rounded-lg shadow-xl overflow-auto max-h-[80vh] font-mono text-sm border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Mobile SDK Integration Guide</h2>

      <div className="mb-6">
        <h3 className="text-lg text-emerald-400 mb-2">Architecture</h3>
        <p className="mb-2">The Mobile Voice Agent captures audio natively (16kHz PCM), streams it to Gemini Live via WebSocket/gRPC, and handles the ticket submission logic via the MCP API.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li><strong>Input:</strong> Native Microphone -&gt; PCM16 Buffer -&gt; WebSocket</li>
          <li><strong>Output:</strong> WebSocket -&gt; PCM16 -&gt; Native Audio Player</li>
          <li><strong>Auth:</strong> Fetch ephemeral JWT from your backend before connecting.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg text-blue-400 mb-2">React Native Implementation (Pseudo-code)</h3>
        <pre className="bg-slate-800 p-4 rounded text-xs overflow-x-auto text-blue-200">
          {`// 1. Dependencies
import LiveAudioStream from 'react-native-live-audio-stream';
import WebSocket from 'isomorphic-ws';

// 2. Configuration
const options = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  bufferSize: 4096,
};

// 3. Connect to Proxy or Direct
const ws = new WebSocket('wss://generativelanguage.googleapis.com/...');

// 4. Capture & Stream
LiveAudioStream.init(options);
LiveAudioStream.on('data', (data) => {
  // 'data' is base64 PCM. Send directly to Gemini Live
  const payload = {
    realtime_input: {
      media_chunks: [{
        mime_type: 'audio/pcm',
        data: data
      }]
    }
  };
  ws.send(JSON.stringify(payload));
});

LiveAudioStream.start();

// 5. Handle Response
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  if (response.serverContent?.modelTurn) {
    // Decode audio and play using react-native-sound or expo-av
    playPcmBuffer(response.serverContent.modelTurn.parts[0].inlineData.data);
  }
  if (response.serverContent?.turnComplete) {
     // Store transcript for ticket generation
  }
};`}
        </pre>
      </div>

      <div className="mb-6">
        <h3 className="text-lg text-orange-400 mb-2">iOS Native (Swift)</h3>
        <pre className="bg-slate-800 p-4 rounded text-xs overflow-x-auto text-orange-200">
          {`// Use AVAudioEngine for low latency input/output

let audioEngine = AVAudioEngine()
let inputNode = audioEngine.inputNode
let format = inputNode.outputFormat(forBus: 0)

// Install Tap to capture audio
inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, time in
    // 1. Convert AVAudioPCMBuffer to 16kHz Int16 Data
    let pcmData = convertToPCM16(buffer)
    
    // 2. Send to WebSocket
    webSocketTask.send(.data(pcmData)) { error in ... }
}

// Prepare Audio Engine
audioEngine.prepare()
try audioEngine.start()`}
        </pre>
      </div>
    </div>
  );
};

export default MobileDocs;
