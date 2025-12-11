import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RabbitMQProducerService } from '../rabbitmq/rabbitmq-producer.service';
import { RabbitMQConsumerService } from '../rabbitmq/rabbitmq-consumer.service';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly producerService: RabbitMQProducerService,
    private readonly consumerService: RabbitMQConsumerService,
  ) {}

  @Post('send')
  async sendMessage(@Body() body: { queue: string; message: unknown }) {
    const { queue, message } = body;
    const result = await this.producerService.publishMessage(queue, message);
    return {
      success: result,
      message: result ? 'Message sent successfully' : 'Failed to send message',
    };
  }

  @Post('publish')
  async publishToExchange(
    @Body()
    body: {
      exchange: string;
      routingKey: string;
      message: unknown;
      exchangeType?: string;
    },
  ) {
    const { exchange, routingKey, message, exchangeType } = body;
    const result = await this.producerService.publishToExchange(
      exchange,
      routingKey,
      message,
      exchangeType,
    );
    return {
      success: result,
      message: result
        ? 'Message published successfully'
        : 'Failed to publish message',
    };
  }

  @Get('consume/:queue')
  async startConsumingQueue(@Param('queue') queue: string) {
    await this.consumerService.consumeQueue(
      queue,
      (message) => {
        console.log(`Processing message from ${queue}:`, message);
      },
      {
        durable: true,
        prefetch: 10,
      },
    );
    return {
      message: `Started consuming queue: ${queue}`,
    };
  }
}
