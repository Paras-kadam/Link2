import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private queuedListeners: { event: string; callback: (...args: any[]) => void }[] = [];
  
  public connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('[socket] Connected', this.socket?.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[socket] Connection error', error);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('[socket] Disconnected', reason);
      });

      // Apply queued listeners
      this.queuedListeners.forEach(({ event, callback }) => {
        this.socket!.on(event, callback);
      });
      this.queuedListeners = [];
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.queuedListeners = [];
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      this.queuedListeners.push({ event, callback });
    }
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    } else {
      if (callback) {
        this.queuedListeners = this.queuedListeners.filter(l => l.event !== event || l.callback !== callback);
      } else {
        this.queuedListeners = this.queuedListeners.filter(l => l.event !== event);
      }
    }
  }

  public emit(event: string, data?: any, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
    } else {
      console.warn(`[socket] Attempted to emit ${event} before socket connected`);
    }
  }
}

export const socketService = new SocketService();
