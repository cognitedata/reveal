export class CustomError extends Error {
  readonly status;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
