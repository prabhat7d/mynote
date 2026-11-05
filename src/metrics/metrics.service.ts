import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();

  readonly requestsTotal: Counter;
  readonly requestDuration: Histogram;

  constructor() {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'mynote_',
    });

    this.requestsTotal = new Counter({
      name: 'mynote_http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.requestDuration = new Histogram({
      name: 'mynote_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  async getMetrics() {
    return this.registry.metrics();
  }
}