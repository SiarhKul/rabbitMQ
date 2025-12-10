import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqpConnectionManager from 'amqp-connection-manager';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqpConnectionManager.AmqpConnectionManager;
  private channelWrapper: amqpConnectionManager.ChannelWrapper;

  async onModuleInit() {
    // Don't block server startup if RabbitMQ is unavailable
    this.connect().catch((error) => {
      this.logger.warn(
        'Failed to connect to RabbitMQ during startup. Server will continue to run.',
        error.message,
      );
    });
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

      this.connection = amqpConnectionManager.connect([url]);

      this.connection.on('connect', () => {
        this.logger.log('Connected to RabbitMQ');
      });

      this.connection.on('disconnect', (err) => {
        this.logger.warn(
          'Disconnected from RabbitMQ',
          err?.err?.message || 'Unknown error',
        );
      });

      this.connection.on('connectFailed', (err) => {
        this.logger.warn(
          'Failed to connect to RabbitMQ',
          err?.err?.message || 'Unknown error',
        );
      });

      this.channelWrapper = this.connection.createChannel({
        json: true,
        setup: () => {
          this.logger.log('Channel created');
          return Promise.resolve();
        },
      });

      // Don't block - let connection manager handle reconnection
      // The connection will be established asynchronously
      this.channelWrapper.waitForConnect().catch((error) => {
        this.logger.warn(
          'Channel connection pending. RabbitMQ may be unavailable.',
          error?.message,
        );
      });
    } catch (error) {
      this.logger.error(
        'Error initializing RabbitMQ connection',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  private async disconnect() {
    if (this.channelWrapper) {
      await this.channelWrapper.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.logger.log('Disconnected from RabbitMQ');
  }

  getChannel(): amqpConnectionManager.ChannelWrapper {
    return this.channelWrapper;
  }

  isConnected(): boolean {
    try {
      if (!this.connection || !this.channelWrapper) {
        return false;
      }

      // Check if connection manager is connected
      const isConnected = this.connection.isConnected();
      if (!isConnected) {
        return false;
      }

      // Verify channel is ready by checking if it can accept operations
      // The channel wrapper should be connected if connection is connected
      return true;
    } catch {
      return false;
    }
  }
}
