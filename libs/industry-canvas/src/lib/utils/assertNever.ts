function assertNever(x: never, message?: string): never {
  throw new Error(message || 'Unexpected object: ' + x);
}

export default assertNever;
