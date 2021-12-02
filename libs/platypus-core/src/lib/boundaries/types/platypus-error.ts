export class PlatypusError {
  message: string;
  code?: number;
  type: string;
  stack?: unknown;

  constructor(message: string, type: string, code?: number, stack?: unknown) {
    this.message = message;
    this.type = type;
    if (code) this.code = code;

    if (stack) {
      this.stack = stack;
    }
  }
  toString(): string {
    return this.message;
  }
}
