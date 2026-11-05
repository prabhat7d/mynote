import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, finalize } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    if (request.path === '/metrics') {
      return next.handle();
    }

    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const duration =
          Number(process.hrtime.bigint() - start) / 1e9;

        const labels = {
          method: request.method,
          route: request.route?.path || 'unmatched',
          status_code: String(response.statusCode),
        };

        this.metrics.requestsTotal.inc(labels);

        this.metrics.requestDuration.observe(
          labels,
          duration,
        );
      }),
    );
  }
}