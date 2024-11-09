// Nestjs dependencies
import { HttpException, HttpStatus } from '@nestjs/common';

export class MeliException extends HttpException {
  constructor({
    error,
    errorCode,
    statusCode,
    extra = {},
  }: {
    error: string;
    errorCode: string;
    statusCode: HttpStatus;
    extra?: Record<string, unknown>;
  }) {
    super(
      {
        error,
        errorCode,
        extra,
      },
      statusCode
    );
  }
}
