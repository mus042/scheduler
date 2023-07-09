import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe,  } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors());
  app.useGlobalPipes(new ValidationPipe({whitelist: true})) //This will add pipe globaly. Whitelist will strip out unknown fields. 
  // app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(3000
    );
}
bootstrap();
