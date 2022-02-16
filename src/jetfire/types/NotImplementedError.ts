class NotImplementedError extends Error {
  readonly name = 'NotImplementedError';

  constructor() {
    super('This has not been implemented');
  }
}
export default NotImplementedError;
