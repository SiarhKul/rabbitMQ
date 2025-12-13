import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async consumeQueue(
    queue: string,
    callback: (message: unknown) => Promise<void> | void,
    options?: {
      durable?: boolean;
      prefetch?: number;
    },
  ): Promise<void> {
    try {
      const channelWrapper = this.rabbitMQService.getChannel();

      await channelWrapper.addSetup(async (channel: amqp.Channel) => {
        await channel.assertQueue(queue, {
          durable: options?.durable ?? true,
        });

        if (options?.prefetch) {
          await channel.prefetch(options.prefetch);
        }

        this.logger.log(`Starting to consume queue: ${queue}`);

        await channel.consume(
          queue,
          (msg: amqp.ConsumeMessage | null) => {
            if (!msg) {
              return;
            }

            void (async () => {
              try {
                const content: unknown = JSON.parse(msg.content.toString());
                this.logger.log(
                  `Received message from queue: ${queue}`,
                  content,
                );

                await callback(content);

                channel.ack(msg);
              } catch (error) {
                this.logger.error(
                  `Error processing message from queue ${queue}:`,
                  error,
                );
                channel.nack(msg, false, false); // Reject and don't requeue
              }
            })();
          },
          {
            noAck: false,
          },
        );
      });
    } catch (error) {
      this.logger.error(`Error consuming queue ${queue}:`, error);
      throw error;
    }
  }

  async consumeExchange(
    exchange: string,
    routingKey: string,
    queue: string,
    callback: (message: unknown) => Promise<void> | void,
    exchangeType: string = 'topic',
  ): Promise<void> {
    try {
      const channelWrapper = this.rabbitMQService.getChannel();

      await channelWrapper.addSetup(async (channel: amqp.Channel) => {
        await channel.assertExchange(exchange, exchangeType, {
          durable: true,
        });

        await channel.assertQueue(queue, {
          durable: true,
        });

        await channel.bindQueue(queue, exchange, routingKey);

        this.logger.log(
          `Starting to consume exchange: ${exchange} with routing key: ${routingKey}`,
        );

        await channel.consume(
          queue,
          (msg: amqp.ConsumeMessage | null) => {
            if (!msg) {
              return;
            }

            void (async () => {
              try {
                const content: unknown = JSON.parse(msg.content.toString());
                this.logger.log(
                  `Received message from exchange: ${exchange} with routing key: ${routingKey}`,
                  content,
                );

                await callback(content);

                channel.ack(msg);
              } catch (error) {
                this.logger.error(
                  `Error processing message from exchange ${exchange}:`,
                  error,
                );
                channel.nack(msg, false, false);
              }
            })();
          },
          {
            noAck: false,
          },
        );
      });
    } catch (error) {
      this.logger.error(`Error consuming exchange ${exchange}:`, error);
      throw error;
    }
  }
}
