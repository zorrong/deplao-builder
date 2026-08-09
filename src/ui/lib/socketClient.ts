import { io } from 'socket.io-client';

const socket = io('http://localhost:27798');

socket.on('connect', () => {
  console.log('[SidecarClient] Connected to Sidecar WebSocket');
});

export function socketInvoke(channel: string, args: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    socket.emit('ipc:invoke', { channel, args: [args] }, (response: any) => {
      if (response && response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response?.error || 'Unknown IPC error'));
      }
    });
  });
}

export function socketSend(channel: string, args: any = {}) {
  socket.emit('ipc:send', { channel, args: [args] });
}

export function socketOn(channel: string, listener: (...args: any[]) => void) {
  socket.on('ipc:event', (data: { channel: string; args: any[] }) => {
    if (data.channel === channel) {
      listener(null, ...data.args);
    }
  });
}

export function socketOff(channel: string) {
  socket.off('ipc:event'); // Note: This removes all listeners. In a real implementation, you'd filter by channel.
}
