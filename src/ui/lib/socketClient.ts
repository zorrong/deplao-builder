import { io } from 'socket.io-client';

const socket = io('http://localhost:27798');

socket.on('connect', () => {
  console.log('[SidecarClient] Connected to Sidecar WebSocket');
});

const channelListeners = new Map<string, Set<(...args: any[]) => void>>();

socket.on('ipc:event', (data: { channel: string; args: any[] }) => {
  if (!data || !data.channel) return;
  const listeners = channelListeners.get(data.channel);
  if (listeners && listeners.size > 0) {
    for (const listener of listeners) {
      try {
        listener(...(data.args || []));
      } catch (err) {
        console.error(`[SidecarClient] Listener error on channel ${data.channel}:`, err);
      }
    }
  }
});

export function socketInvoke(channel: string, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    socket.emit('ipc:invoke', { channel, args }, (response: any) => {
      if (response && response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response?.error || `IPC error on ${channel}`));
      }
    });
  });
}

export function socketSend(channel: string, ...args: any[]) {
  socket.emit('ipc:send', { channel, args });
}

export function socketOn(channel: string, listener: (...args: any[]) => void) {
  if (!channelListeners.has(channel)) {
    channelListeners.set(channel, new Set());
  }
  channelListeners.get(channel)!.add(listener);
}

export function socketOff(channel: string, listener?: (...args: any[]) => void) {
  if (!listener) {
    channelListeners.delete(channel);
  } else {
    const listeners = channelListeners.get(channel);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        channelListeners.delete(channel);
      }
    }
  }
}
