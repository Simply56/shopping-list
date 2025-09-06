import { Component } from '@angular/core';
import { ShoppingListService } from './services/shopping-list.service';

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  newItemName = '';
  shoppingList: ShoppingItem[] = [];
  isConnected = false;

  constructor(private shoppingListService: ShoppingListService) {
    this.shoppingListService.getShoppingList().subscribe(list => {
      this.shoppingList = list;
    });

    this.shoppingListService.getConnectionStatus().subscribe(status => {
      this.isConnected = status;
    });
  }

  addItem() {
    if (this.newItemName.trim()) {
      if (this.shoppingListService.isConnected()) {
        this.shoppingListService.addItem(this.newItemName.trim());
        this.newItemName = '';
      } else {
        alert('Cannot add item: No connection to server. Please check your internet connection.');
      }
    }
  }

  toggleItem(item: ShoppingItem) {
    console.log('Toggling item:', item.name, 'from', item.completed, 'to', !item.completed);
    if (this.shoppingListService.isConnected()) {
      this.shoppingListService.toggleItem(item.id);
    } else {
      alert('Cannot toggle item: No connection to server. Please check your internet connection.');
    }
  }

  deleteItem(item: ShoppingItem) {
    if (this.shoppingListService.isConnected()) {
      this.shoppingListService.deleteItem(item.id);
    } else {
      alert('Cannot delete item: No connection to server. Please check your internet connection.');
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addItem();
    }
  }
}
