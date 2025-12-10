import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { MessageModule } from './message/message.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [RabbitMQModule, MessageModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
