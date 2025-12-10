import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProducerService {
  private readonly logger = new Logger(RabbitMQProducerService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishMessage(queue: string, message: unknown): Promise<boolean> {
    try {
      const channelWrapper = this.rabbitMQService.getChannel();

      await channelWrapper.addSetup(async (channel: amqp.Channel) => {
        await channel.assertQueue(queue, {
          durable: true,
        });
      });

      const sent = await channelWrapper.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        },
      );

      if (sent) {
        this.logger.log(`Message sent to queue: ${queue}`, message);
        return true;
      } else {
        this.logger.warn(`Message not sent to queue: ${queue}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error publishing message to queue ${queue}:`, error);
      throw error;
    }
  }

  async publishToExchange(
    exchange: string,
    routingKey: string,
    message: unknown,
    exchangeType: string = 'topic',
  ): Promise<boolean> {
    try {
      const channelWrapper = this.rabbitMQService.getChannel();

      await channelWrapper.addSetup(async (channel: amqp.Channel) => {
        await channel.assertExchange(exchange, exchangeType, {
          durable: true,
        });
      });

      const sent = await channelWrapper.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        },
      );

      if (sent) {
        this.logger.log(
          `Message published to exchange: ${exchange} with routing key: ${routingKey}`,
          message,
        );
        return true;
      } else {
        this.logger.warn(
          `Message not published to exchange: ${exchange} with routing key: ${routingKey}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Error publishing message to exchange ${exchange}:`,
        error,
      );
      throw error;
    }
  }
}
