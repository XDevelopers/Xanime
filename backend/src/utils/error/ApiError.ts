class ApiError extends Error {
  statusCode: number;
  error: string | null;
  message: string;
  stack?: string;

  constructor(
    statusCode: number,
    error: string | null,
    message: string,
    stack?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.message = message;

    // Capture stack trace if not provided
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError ;