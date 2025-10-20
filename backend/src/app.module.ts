import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
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
      envFilePath: '.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().default('your-super-secret-jwt-key-here'),
        JWT_EXPIRES_IN: Joi.string().default('24h'),
        PORT: Joi.number().default(5500),
        NODE_ENV: Joi.string().default('development'),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
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
