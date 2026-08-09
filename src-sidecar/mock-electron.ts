import Module from 'module';
import { ipcMainMock } from './ipc-mock';

const originalRequire = Module.prototype.require;
(Module.prototype as any).require = function(id: string) {
  if (id === 'electron') {
    return {
      ipcMain: ipcMainMock,
      BrowserWindow: class {
        static getAllWindows() { return []; }
        static getFocusedWindow() { return null; }
        webContents = { send: () => {} };
      },
      app: { 
        getPath: (_name: string) => './data',
        getAppPath: () => './',
        on: () => {},
        whenReady: () => Promise.resolve(),
      },
      safeStorage: {
        isEncryptionAvailable: () => false,
        decryptString: (buf: any) => buf ? buf.toString() : '',
        encryptString: (str: any) => Buffer.from(str || ''),
      },
      shell: { openExternal: () => {} },
      dialog: { showOpenDialog: () => Promise.resolve({ canceled: true, filePaths: [] }) }
    };
  }
  return originalRequire.apply(this, arguments as any);
};
