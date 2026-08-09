const fs = require('fs');
let data = fs.readFileSync('electron/preload.ts', 'utf8');

// Replace standard invokes with args
data = data.replace(/ipcRenderer\.invoke\('([^']+)',\s*(.*?)\)/g, 'socketInvoke(\'$1\', $2)');
// Replace invokes without args
data = data.replace(/ipcRenderer\.invoke\('([^']+)'\)/g, 'socketInvoke(\'$1\')');

// Replace sends with args
data = data.replace(/ipcRenderer\.send\('([^']+)',\s*(.*?)\)/g, 'socketSend(\'$1\', $2)');
// Replace sends without args
data = data.replace(/ipcRenderer\.send\('([^']+)'\)/g, 'socketSend(\'$1\')');

// Replace imports
data = data.replace(/import \{ contextBridge, ipcRenderer \} from 'electron';/g, 'import { socketInvoke, socketSend, socketOn, socketOff } from \'./socketClient\';');
data = data.replace(/import type \{ TelegramForumTopicContext \} from '\.\.\/src\/models\/telegram';/g, 'import type { TelegramForumTopicContext } from \'../../models/telegram\';');

// Expose directly to window
data = data.replace(/contextBridge\.exposeInMainWorld\('electronAPI',\s*/g, 'window.electronAPI = ');

// Process platform shim
data = data.replace(/platform:\s*process\.platform,/g, "platform: typeof process !== 'undefined' ? process.platform : 'win32',");

// Prevent uncaught rejection on window:isMaximized
data = data.replace(/isMaximized:\s*\(\)\s*=>\s*socketInvoke\('window:isMaximized'\)/g, "isMaximized: () => socketInvoke('window:isMaximized').catch(() => false)");

// Replace generic on method block
data = data.replace(/on:\s*\((.*?)\)\s*=>\s*\{[\s\S]*?\},/g, 'on: (channel: string, callback: (...args: any[]) => void) => {\n    socketOn(channel, callback);\n    return () => socketOff(channel, callback);\n  },');

// Replace generic removeAllListeners method
data = data.replace(/removeAllListeners:\s*\(channel:\s*string\)\s*=>\s*\{[\s\S]*?\},/g, 'removeAllListeners: (channel: string) => {\n    socketOff(channel);\n  },');

// Fix closing syntax
data = data.replace(/\}\);\s*$/, '};');

fs.writeFileSync('src/ui/lib/sidecarClient.ts', data);
console.log('Build completed');
