import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

export interface HealthCheckResult {
  status: 'up' | 'down';
  message: string;
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  checks: {
    application: HealthCheckResult;
    rabbitmq: HealthCheckResult;
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  checkHealth(): HealthStatus {
    const checks = {
      application: this.checkApplication(),
      rabbitmq: this.checkRabbitMQ(),
    };

    const isHealthy =
      checks.application.status === 'up' && checks.rabbitmq.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    };
  }

  private checkApplication(): HealthCheckResult {
    return {
      status: 'up',
      message: 'Application is running',
      timestamp: new Date().toISOString(),
    };
  }

  private checkRabbitMQ(): HealthCheckResult {
    try {
      const isConnected = this.rabbitMQService.isConnected();

      if (!isConnected) {
        return {
          status: 'down',
          message: 'RabbitMQ connection is not available',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'up',
        message: 'RabbitMQ connection is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'down',
        message: `RabbitMQ health check failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
