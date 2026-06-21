class ApiResponse {
  statusCode: number;
  message: string;
  data: unknown;
  success: boolean;

  constructor(
    statusCode: number,
    data: unknown,
    message: string = "success"
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export default ApiResponse ;