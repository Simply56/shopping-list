import { Module } from '@nestjs/common';
import { ShoppingListGateway } from './shopping-list.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [ShoppingListGateway],
})
export class AppModule {}
