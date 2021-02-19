export const mock = {
  getFlow: () => {
    return {
      flow: 'test-flow',
    };
  },
  CogniteAuth: (client: unknown) => ({
    state: {},
    getClient: () => client,
    onAuthChanged: (
      applicationId: string,
      callback: (state: unknown) => void
    ) => {
      callback({
        applicationId,
        authenticated: true,
      });
      return jest.fn();
    },
  }),
};
