import { io } from 'socket.io-client';

const socket = io('http://localhost:27798');

socket.on('connect', () => {
    console.log('Connected to Sidecar');
    
    socket.emit('ipc:invoke', { channel: 'login:qr', args: [{ tempId: 'test_qr_123' }] }, (res: any) => {
        console.log('login:qr response:', res);
    });
});

socket.on('ipc:event', (data: any) => {
    console.log('Received Event:', data);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});
