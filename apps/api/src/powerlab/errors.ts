import { HttpException } from '@nestjs/common';

export function labError(status: number, code: string, message: string): never {
  throw new HttpException({ code, message, retryable: status >= 500 }, status);
}
