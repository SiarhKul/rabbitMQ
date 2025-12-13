import { Module } from '@nestjs/common';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { MessageModule } from './message/message.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [RabbitMQModule, MessageModule, HealthModule],
})
export class AppModule {}
