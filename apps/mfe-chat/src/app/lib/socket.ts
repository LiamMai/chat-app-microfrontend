import { io, Socket } from 'socket.io-client';
import { chatApi } from './api';

declare global {
  interface Window {
    __WS_URL__?: string;
  }
}

const WS_URL =
  (typeof window !== 'undefined' && window.__WS_URL__) ||
  'http://localhost:3000';

let socketPromise: Promise<Socket> | null = null;

async function createSocket(): Promise<Socket> {
  const { token, success } = await chatApi.fetchWsToken();
  if (!success || !token) {
    throw new Error('Unable to fetch websocket auth token');
  }

  const socket = io(`${WS_URL}/chat`, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });

  return new Promise<Socket>((resolve, reject) => {
    const onConnect = () => {
      socket.off('connect_error', onConnectError);
      resolve(socket);
    };

    const onConnectError = (error: Error) => {
      socket.off('connect', onConnect);
      socket.disconnect();
      socketPromise = null;
      reject(error);
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onConnectError);

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server kicked us, usually because auth expired. Next caller gets a fresh token.
        socketPromise = null;
      }
    });

    socket.connect();
  });
}

export function getChatSocket(): Promise<Socket> {
  if (!socketPromise) {
    socketPromise = createSocket().catch((error) => {
      socketPromise = null;
      throw error;
    });
  }
  return socketPromise;
}

export async function disconnectChatSocket(): Promise<void> {
  if (!socketPromise) return;
  const sock = await socketPromise;
  sock.removeAllListeners();
  sock.disconnect();
  socketPromise = null;
}
