class JetfireApiError extends Error {
  readonly message: string;

  readonly requestStatus: number;

  constructor(message: string, requestStatus: number) {
    super(message);
    this.message = message;
    this.requestStatus = requestStatus;
  }
}

export default JetfireApiError;
