import ZaloLoginHelper from './src/utils/ZaloLoginHelper';
import EventBroadcaster from './src/services/event/EventBroadcaster';

// Mock _sidecarBroadcaster
const originalSet = require('./src/services/event/EventBroadcaster').setSidecarBroadcaster;
originalSet((channel: string, data: any) => {
    console.log('[Mock SidecarBroadcaster]', channel, data);
});

async function run() {
    console.log('Starting direct loginQR...');
    const helper = new ZaloLoginHelper();
    try {
        await helper.loginQR('test_123', null);
        console.log('Finished loginQR successfully');
    } catch (e: any) {
        console.error('loginQR threw error:', e.message);
    }
}
run();
