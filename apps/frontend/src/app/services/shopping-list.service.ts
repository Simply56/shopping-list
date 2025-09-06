import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private socket: Socket;
  private shoppingListSubject = new BehaviorSubject<ShoppingItem[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.socket = io('https://ife6qc-ip-193-179-119-118.tunnelmole.net/', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Connection status
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connectionStatusSubject.next(true);
      // Request current shopping list when reconnecting
      this.getShoppingListSync();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      this.connectionStatusSubject.next(true);
      // Request current shopping list when reconnecting
      this.getShoppingListSync();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.log('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      this.connectionStatusSubject.next(false);
    });

    // Shopping list updates
    this.socket.on('shoppingList', (list: ShoppingItem[]) => {
      console.log('Received shopping list:', list);
      this.shoppingListSubject.next(list);
    });
  }

  getShoppingList(): Observable<ShoppingItem[]> {
    return this.shoppingListSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  addItem(name: string) {
    this.socket.emit('addItem', { name });
  }

  toggleItem(id: string) {
    console.log('Sending toggleItem event for id:', id);
    this.socket.emit('toggleItem', { id });
  }

  deleteItem(id: string) {
    this.socket.emit('deleteItem', { id });
  }

  getShoppingListSync() {
    this.socket.emit('getShoppingList');
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  disconnect() {
    this.socket.disconnect();
  }
}
