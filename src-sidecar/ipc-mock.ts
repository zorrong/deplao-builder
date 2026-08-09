import { Server, Socket } from 'socket.io';
import { setSidecarBroadcaster } from '../src/services/event/EventBroadcaster';

type Handler = (event: any, ...args: any[]) => Promise<any> | any;
type Listener = (event: any, ...args: any[]) => void;

class IpcMainMock {
  private handlers = new Map<string, Handler>();
  private listeners = new Map<string, Listener[]>();
  private io: Server | null = null;

  init(io: Server) {
    this.io = io;

    // Đăng ký broadcaster callback tới EventBroadcaster
    setSidecarBroadcaster((channel: string, data: any) => {
      this.sendToAll(channel, data);
    });

    // Đăng ký các handler mặc định cho Window
    this.handle('window:isMaximized', () => false);
    this.handle('window:minimize', () => ({ success: true }));
    this.handle('window:maximize', () => ({ success: true }));
    this.handle('window:close', () => ({ success: true }));
    this.handle('window:quit', () => ({ success: true }));

    io.on('connection', (socket: Socket) => {
      // 1. Lắng nghe các lệnh invoke() (request/response)
      socket.on('ipc:invoke', async (data: { channel: string; args: any[] }, callback) => {
        const handler = this.handlers.get(data.channel);
        if (!handler) {
          console.warn(`[ipcMainMock] No handler for channel: ${data.channel}`);
          return callback({ success: false, error: `No handler registered for ${data.channel}` });
        }
        try {
          const result = await handler({ sender: socket }, ...(data.args || []));
          callback({ success: true, data: result });
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      });
      
      // 2. Lắng nghe các sự kiện send() (fire-and-forget)
      socket.on('ipc:send', (data: { channel: string; args: any[] }) => {
          const channelListeners = this.listeners.get(data.channel) || [];
          for (const listener of channelListeners) {
              listener({ sender: socket }, ...(data.args || []));
          }
      });
    });
  }

  // Đăng ký nhận invoke từ UI
  handle(channel: string, listener: Handler) {
    this.handlers.set(channel, listener);
  }

  // Đăng ký nhận sự kiện send từ UI
  on(channel: string, listener: Listener) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push(listener);
  }

  // Thay thế cho mainWindow.webContents.send (Gửi từ Backend -> UI)
  sendToAll(channel: string, ...args: any[]) {
    if (this.io) {
      this.io.emit('ipc:event', { channel, args });
    }
  }
}

export const ipcMainMock = new IpcMainMock();
