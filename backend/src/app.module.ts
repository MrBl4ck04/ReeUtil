import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { DevicesModule } from './devices/devices.module';
import { QuotationsModule } from './quotations/quotations.module';
import { RulesModule } from './rules/rules.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://mati:clapper123@reeutil.f0n5a.mongodb.net/reeutil'),
    AuthModule,
    UsersModule,
    CatalogModule,
    DevicesModule,
    QuotationsModule,
    RulesModule,
    InventoryModule,
  ],
})
export class AppModule {}
