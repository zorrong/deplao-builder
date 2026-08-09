import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Module from 'module';

// 1. Mock Electron require
const originalRequire = Module.prototype.require;
(Module.prototype as any).require = function(id: string) {
  if (id === 'electron') {
    return {
      ipcMain: require('./ipc-mock').ipcMainMock,
      BrowserWindow: class {},
      app: { 
        getPath: (name: string) => './data',
        getAppPath: () => './'
      },
      safeStorage: {
        isEncryptionAvailable: () => false,
        decryptString: (buf: any) => buf.toString()
      },
      shell: {},
      dialog: {}
    };
  }
  return originalRequire.apply(this, arguments as any);
};

// 2. Setup Server
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

// 3. Initialize IPC Mock
const { ipcMainMock } = require('./ipc-mock');
ipcMainMock.init(io);

// 4. Import & Register All Services
import { registerLoginIpc } from '../electron/ipc/loginIpc';
import { registerZaloIpc } from '../electron/ipc/zaloIpc';
import { registerDatabaseIpc } from '../electron/ipc/databaseIpc';
import { registerFileIpc } from '../electron/ipc/fileIpc';
import { registerCRMIpc } from '../electron/ipc/crmIpc';
import { registerWorkflowIpc } from '../electron/ipc/workflowIpc';
import { registerIntegrationIpc } from '../electron/ipc/integrationIpc';
import { registerAIAssistantIpc } from '../electron/ipc/aiAssistantIpc';
import { registerUtilIpc } from '../electron/ipc/utilIpc';
import { registerEmployeeIpc } from '../electron/ipc/employeeIpc';
import { registerRelayIpc } from '../electron/ipc/relayIpc';
import { registerWorkspaceIpc } from '../electron/ipc/workspaceIpc';
import { registerFacebookIpc } from '../electron/ipc/facebookIpc';
import { registerTelegramIpc } from '../electron/ipc/telegramIpc';
import { registerTelegramUserIpc } from '../electron/ipc/telegramUserIpc';
import { registerProxyIpc } from '../electron/ipc/proxyIpc';
import { registerErpTaskIpc } from '../electron/ipc/erpTaskIpc';
import { registerErpCalendarIpc } from '../electron/ipc/erpCalendarIpc';
import { registerErpNoteIpc } from '../electron/ipc/erpNoteIpc';
import { registerErpNotificationIpc } from '../electron/ipc/erpNotificationIpc';
import { registerErpHrmIpc } from '../electron/ipc/erpHrmIpc';
import { registerLockScreenIpc } from '../electron/ipc/lockScreenIpc';
import { registerLibraryIpc } from '../electron/ipc/libraryIpc';

const registerFunctions = [
  { name: 'loginIpc', fn: registerLoginIpc },
  { name: 'zaloIpc', fn: registerZaloIpc },
  { name: 'databaseIpc', fn: registerDatabaseIpc },
  { name: 'fileIpc', fn: registerFileIpc },
  { name: 'crmIpc', fn: registerCRMIpc },
  { name: 'workflowIpc', fn: registerWorkflowIpc },
  { name: 'integrationIpc', fn: registerIntegrationIpc },
  { name: 'aiAssistantIpc', fn: registerAIAssistantIpc },
  { name: 'utilIpc', fn: registerUtilIpc },
  { name: 'employeeIpc', fn: registerEmployeeIpc },
  { name: 'relayIpc', fn: registerRelayIpc },
  { name: 'workspaceIpc', fn: registerWorkspaceIpc },
  { name: 'facebookIpc', fn: registerFacebookIpc },
  { name: 'telegramIpc', fn: registerTelegramIpc },
  { name: 'telegramUserIpc', fn: registerTelegramUserIpc },
  { name: 'proxyIpc', fn: registerProxyIpc },
  { name: 'erpTaskIpc', fn: registerErpTaskIpc },
  { name: 'erpCalendarIpc', fn: registerErpCalendarIpc },
  { name: 'erpNoteIpc', fn: registerErpNoteIpc },
  { name: 'erpNotificationIpc', fn: registerErpNotificationIpc },
  { name: 'erpHrmIpc', fn: registerErpHrmIpc },
  { name: 'lockScreenIpc', fn: registerLockScreenIpc },
  { name: 'libraryIpc', fn: registerLibraryIpc },
];

for (const mod of registerFunctions) {
  try {
    mod.fn(null as any);
    console.log(`[Sidecar] Successfully registered ${mod.name}`);
  } catch (err: any) {
    console.error(`[Sidecar] Failed to register ${mod.name}:`, err.message);
  }
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'deplao-sidecar' }));

const PORT = process.env.SIDECAR_PORT || 27798;
server.listen(PORT, () => console.log(`[Sidecar] Server is running on http://localhost:${PORT}`));
