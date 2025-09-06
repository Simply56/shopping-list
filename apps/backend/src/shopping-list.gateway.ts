import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ShoppingListGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // In-memory storage for shopping list items
  private shoppingList: ShoppingItem[] = [];
  private readonly dataFilePath = path.join(process.cwd(), 'shopping-list-data.json');

  constructor() {
    this.loadDataFromFile();
  }

  private loadDataFromFile() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsedData = JSON.parse(data);
        // Convert createdAt strings back to Date objects
        this.shoppingList = parsedData.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        console.log(`Loaded ${this.shoppingList.length} items from file`);
      } else {
        console.log('No existing data file found, starting with empty list');
        this.shoppingList = [];
      }
    } catch (error) {
      console.error('Error loading data from file:', error);
      this.shoppingList = [];
    }
  }

  private saveDataToFile() {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.shoppingList, null, 2));
      console.log(`Saved ${this.shoppingList.length} items to file`);
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Send current shopping list to newly connected client
    client.emit('shoppingList', this.shoppingList);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('addItem')
  handleAddItem(@MessageBody() data: { name: string }, @ConnectedSocket() client: Socket) {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: data.name,
      completed: false,
      createdAt: new Date(),
    };

    this.shoppingList.push(newItem);
    
    // Save to file
    this.saveDataToFile();
    
    // Broadcast to all connected clients
    this.server.emit('shoppingList', this.shoppingList);
    
    console.log(`Item added: ${newItem.name}`);
  }

  @SubscribeMessage('toggleItem')
  handleToggleItem(@MessageBody() data: { id: string }, @ConnectedSocket() client: Socket) {
    const item = this.shoppingList.find(item => item.id === data.id);
    if (item) {
      item.completed = !item.completed;
      
      // Save to file
      this.saveDataToFile();
      
      // Broadcast to all connected clients
      this.server.emit('shoppingList', this.shoppingList);
      
      console.log(`Item toggled: ${item.name} - ${item.completed ? 'completed' : 'pending'}`);
    }
  }

  @SubscribeMessage('deleteItem')
  handleDeleteItem(@MessageBody() data: { id: string }, @ConnectedSocket() client: Socket) {
    const itemIndex = this.shoppingList.findIndex(item => item.id === data.id);
    if (itemIndex !== -1) {
      const deletedItem = this.shoppingList[itemIndex];
      this.shoppingList.splice(itemIndex, 1);
      
      // Save to file
      this.saveDataToFile();
      
      // Broadcast to all connected clients
      this.server.emit('shoppingList', this.shoppingList);
      
      console.log(`Item deleted: ${deletedItem.name}`);
    }
  }

  @SubscribeMessage('getShoppingList')
  handleGetShoppingList(@ConnectedSocket() client: Socket) {
    client.emit('shoppingList', this.shoppingList);
  }
}
