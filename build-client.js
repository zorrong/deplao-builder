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

// Replace on (listeners)
data = data.replace(/ipcRenderer\.on\('([^']+)',\s*(.*?)\)/g, 'socketOn(\'$1\', $2)');
// Replace removeAllListeners
data = data.replace(/ipcRenderer\.removeAllListeners\('([^']+)'\)/g, 'socketOff(\'$1\')');

// Replace imports
data = data.replace(/import \{ contextBridge, ipcRenderer \} from 'electron';/g, 'import { socketInvoke, socketSend, socketOn, socketOff } from \'./socketClient\';');

// Expose directly to window
data = data.replace(/contextBridge\.exposeInMainWorld\('electronAPI',\s*/g, 'window.electronAPI = ');

// Add a closing bracket at the end if it's missing (it shouldn't be, because we replace contextBridge with just an assignment)
fs.writeFileSync('src/ui/lib/sidecarClient.ts', data);
console.log('Build completed');
