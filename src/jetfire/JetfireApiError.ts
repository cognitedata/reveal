class JetfireApiError extends Error {
  readonly message: string;

  readonly type: string;

  readonly requestStatus: number;

  constructor(message: string, type: string, requestStatus: number) {
    super(message);
    this.message = message;
    this.type = type;
    this.requestStatus = requestStatus;
  }
}

export default JetfireApiError;
