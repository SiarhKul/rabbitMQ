import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(@Res() res: Response) {
    const healthStatus = this.healthService.checkHealth();
    const statusCode =
      healthStatus.status === 'healthy'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: healthStatus.status,
      statusCode,
      checks: healthStatus.checks,
    });
  }

  @Get('liveness')
  liveness() {
    return {
      status: 'up',
      message: 'Service is alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  readiness() {
    const healthStatus = this.healthService.checkHealth();
    const isReady = healthStatus.status === 'healthy';

    return {
      status: isReady ? 'ready' : 'not ready',
      checks: healthStatus.checks,
      timestamp: new Date().toISOString(),
    };
  }
}
