import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  OnModuleInit,
} from '@nestjs/common';
import { RabbitMQProducerService } from '../rabbitmq/rabbitmq-producer.service';
import { RabbitMQConsumerService } from '../rabbitmq/rabbitmq-consumer.service';

@Controller('messages')
export class MessageController implements OnModuleInit {
  constructor(
    private readonly producerService: RabbitMQProducerService,
    private readonly consumerService: RabbitMQConsumerService,
  ) {}

  async onModuleInit() {
    // Start consuming messages when the module is initialized
    await this.startConsumers();
  }

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
    await this.consumerService.consumeQueue(queue, (message) => {
      console.log(`Processing message from ${queue}:`, message);
      // Add your message processing logic here
    });
    return {
      message: `Started consuming queue: ${queue}`,
    };
  }

  private async startConsumers() {
    // Example: Start consuming from a default queue
    const defaultQueue = 'test-queue';

    await this.consumerService.consumeQueue(
      defaultQueue,
      (message) => {
        console.log(`Received message from ${defaultQueue}:`, message);
        // Add your message processing logic here
      },
      {
        durable: true,
        prefetch: 10,
      },
    );
  }
}
