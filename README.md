<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with RabbitMQ integration.

## Project setup

```bash
$ npm install
```

## RabbitMQ Setup

This project includes RabbitMQ integration for message queuing.

### Prerequisites

Make sure RabbitMQ is running on your system. You can install it using Docker:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

The management UI will be available at `http://localhost:15672` (default credentials: guest/guest).

### Configuration

Set the RabbitMQ connection URL in your environment variables:

```bash
RABBITMQ_URL=amqp://localhost:5672
```

Or create a `.env` file:

```
RABBITMQ_URL=amqp://localhost:5672
PORT=3147
```

### Usage

The project includes:

- **RabbitMQService**: Manages the connection to RabbitMQ
- **RabbitMQProducerService**: Publishes messages to queues and exchanges
- **RabbitMQConsumerService**: Consumes messages from queues and exchanges
- **MessageController**: Example endpoints to send and receive messages

#### Sending Messages to a Queue

```bash
POST http://localhost:3147/messages/send
Content-Type: application/json

{
  "queue": "test-queue",
  "message": {
    "text": "Hello RabbitMQ!",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Publishing to an Exchange

```bash
POST http://localhost:3147/messages/publish
Content-Type: application/json

{
  "exchange": "notifications",
  "routingKey": "user.created",
  "message": {
    "userId": 123,
    "email": "user@example.com"
  },
  "exchangeType": "topic"
}
```

#### Starting a Consumer

The application automatically starts consuming from the `test-queue` queue. You can also start consuming from other queues programmatically using the `RabbitMQConsumerService`.

## Health Check

The application includes a custom health checker that monitors the application status and RabbitMQ connection health.

### Health Check Endpoints

#### Full Health Check

Returns the complete health status of the application and all dependencies:

```bash
GET http://localhost:3147/health
```

**Response (Healthy):**

```json
{
  "status": "healthy",
  "statusCode": 200,
  "checks": {
    "application": {
      "status": "up",
      "message": "Application is running",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "rabbitmq": {
      "status": "up",
      "message": "RabbitMQ connection is healthy",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Response (Unhealthy):**

```json
{
  "status": "unhealthy",
  "statusCode": 503,
  "checks": {
    "application": {
      "status": "up",
      "message": "Application is running",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "rabbitmq": {
      "status": "down",
      "message": "RabbitMQ connection is not available",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Liveness Probe

Simple endpoint to check if the service is alive (useful for Kubernetes liveness probes):

```bash
GET http://localhost:3147/health/liveness
```

**Response:**

```json
{
  "status": "up",
  "message": "Service is alive",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Readiness Probe

Checks if the service is ready to accept traffic (useful for Kubernetes readiness probes):

```bash
GET http://localhost:3147/health/readiness
```

**Response (Ready):**

```json
{
  "status": "ready",
  "checks": {
    "application": {
      "status": "up",
      "message": "Application is running",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "rabbitmq": {
      "status": "up",
      "message": "RabbitMQ connection is healthy",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response (Not Ready):**

```json
{
  "status": "not ready",
  "checks": {
    "application": {
      "status": "up",
      "message": "Application is running",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "rabbitmq": {
      "status": "down",
      "message": "RabbitMQ connection is not available",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Using Health Checks

#### With cURL

```bash
# Full health check
curl http://localhost:3147/health

# Liveness probe
curl http://localhost:3147/health/liveness

# Readiness probe
curl http://localhost:3147/health/readiness
```

#### With Kubernetes

You can use these endpoints in your Kubernetes deployment configuration:

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3147
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/readiness
    port: 3147
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Health Check Features

- **Application Health**: Checks if the application is running
- **RabbitMQ Health**: Verifies the RabbitMQ connection status
- **HTTP Status Codes**: Returns 200 for healthy, 503 for unhealthy
- **Timestamps**: Each check includes a timestamp for monitoring
- **Detailed Messages**: Provides specific error messages when checks fail

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
