import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mongoose connection event listeners for clearer logging
  mongoose.connection.on('connected', () => {
    console.log('\u2705 Mongoose connected to', mongoose.connection.host + ':' + mongoose.connection.port);
  });
  mongoose.connection.on('error', (err) => {
    console.error('\u26A0\ufe0f Mongoose connection error:', err.message || err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('\u26A0\ufe0f Mongoose disconnected');
  });

  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('ReeUtil API')
    .setDescription('API para el sistema de reciclaje de dispositivos electrónicos ReeUtil')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 5500;
  await app.listen(port);
  
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 Documentación API disponible en http://localhost:${port}/api`);
}

bootstrap();
