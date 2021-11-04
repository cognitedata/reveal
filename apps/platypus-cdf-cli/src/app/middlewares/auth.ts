// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function authenticate(argv: any) {
  const { apiKey } = argv;

  // We need to check if user is authenticated here
  // if (!apiKey) {
  //   throw Error('Api-key not set. See CLI options on how to set it.');
  // }

  // Login functionality
  // ...

  return {
    apiKey,
  };
}
