import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { data: T; meta: { timestamp: string } }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; meta: { timestamp: string } }> {
    return next.handle().pipe(
      map((data) => ({ data, meta: { timestamp: new Date().toISOString() } })),
    );
  }
}
