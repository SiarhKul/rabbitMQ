import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQProducerService } from './rabbitmq-producer.service';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';

@Module({
  providers: [
    RabbitMQService,
    RabbitMQProducerService,
    RabbitMQConsumerService,
  ],
  exports: [RabbitMQService, RabbitMQProducerService, RabbitMQConsumerService],
})
export class RabbitMQModule {}
