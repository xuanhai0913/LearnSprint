import { HttpException } from '@nestjs/common';
export function careerError(status: number, code: string, message: string): never {
  throw new HttpException({ code, message, retryable: false }, status);
}
