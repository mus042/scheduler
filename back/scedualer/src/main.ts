import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe,  } from '@nestjs/common';
import * as cors from 'cors';
import { EventsGateway } from './events/events.gateway';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: ['http://localhost:19006','http://10.0.0.1:19006'], // Replace with the origin where your React Native app is hosted
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  };


  // Apply CORS middleware
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe({whitelist: true})) //This will add pipe globaly. Whitelist will strip out unknown fields. 
  // app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(3000
    );
//     const eventsGateway = app.get(EventsGateway);
//     setInterval(()=>eventsGateway.sendRequest(),2000)
}
bootstrap();
