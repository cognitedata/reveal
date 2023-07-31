export default {
  getFlow: (): {
    [s: string]: string;
  } => ({
    flow: 'COGNITE_AUTH',
  }),
  CogniteAuth: (client: unknown): unknown => {
    type callbackType = (args: unknown) => void;
    let internalCallback: callbackType = jest.fn();

    const onAuthChanged = (_applicationId: string, callback: callbackType) => {
      internalCallback = callback;
      return jest.fn();
    };

    return {
      state: {
        authenticated: true,
      },
      getClient: () => client,
      login: () => ({}),
      loginInitial: () => ({}),
      loginAndAuthIfNeeded: () => {
        internalCallback({
          client,
          authState: { authenticated: true },
        });
        return {
          initialized: true,
          authenticated: true,
          error: false,
          initializing: false,
        };
      },
      onAuthChanged,
    };
  },
};
