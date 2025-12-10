import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [MessageController],
})
export class MessageModule {}
