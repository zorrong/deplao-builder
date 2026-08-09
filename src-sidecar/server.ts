import './mock-electron';

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { ipcMainMock } from './ipc-mock';

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

// 1. Setup Express & Socket.io Server
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

// 2. Initialize IPC Mock
ipcMainMock.init(io);

// 3. Register All IPC Handlers Statically (Ensure esbuild bundles all IPC handlers!)
const ipcRegistrations: Array<{ name: string; register: (win: any) => void }> = [
  { name: 'loginIpc', register: registerLoginIpc },
  { name: 'zaloIpc', register: registerZaloIpc },
  { name: 'databaseIpc', register: registerDatabaseIpc },
  { name: 'fileIpc', register: registerFileIpc },
  { name: 'crmIpc', register: registerCRMIpc },
  { name: 'workflowIpc', register: registerWorkflowIpc },
  { name: 'integrationIpc', register: registerIntegrationIpc },
  { name: 'aiAssistantIpc', register: registerAIAssistantIpc },
  { name: 'utilIpc', register: registerUtilIpc },
  { name: 'employeeIpc', register: registerEmployeeIpc },
  { name: 'relayIpc', register: registerRelayIpc },
  { name: 'workspaceIpc', register: registerWorkspaceIpc },
  { name: 'facebookIpc', register: registerFacebookIpc },
  { name: 'telegramIpc', register: registerTelegramIpc },
  { name: 'telegramUserIpc', register: registerTelegramUserIpc },
  { name: 'proxyIpc', register: registerProxyIpc },
  { name: 'erpTaskIpc', register: registerErpTaskIpc },
  { name: 'erpCalendarIpc', register: registerErpCalendarIpc },
  { name: 'erpNoteIpc', register: registerErpNoteIpc },
  { name: 'erpNotificationIpc', register: registerErpNotificationIpc },
  { name: 'erpHrmIpc', register: registerErpHrmIpc },
  { name: 'lockScreenIpc', register: registerLockScreenIpc },
  { name: 'libraryIpc', register: registerLibraryIpc },
];

for (const item of ipcRegistrations) {
  try {
    item.register(null);
    console.log(`[Sidecar] Successfully registered ${item.name}`);
  } catch (err: any) {
    console.error(`[Sidecar] Failed to register ${item.name}:`, err.message);
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'deplao-sidecar' }));

const PORT = process.env.SIDECAR_PORT || 27798;
server.listen(PORT, () => console.log(`[Sidecar] Server is running on http://localhost:${PORT}`));
