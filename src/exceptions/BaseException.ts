class BaseExceptions extends Error {
  errData?: any;
  status: number;
  message: string;

  constructor(errData?: any, status: number, message: string) {
    super("Invalid Details");
    this.errData = errData;
    this.status = status;
    this.message = message;
  }
}

export default BaseExceptions;
