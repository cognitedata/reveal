export const describeWithConsoleErrorChecks = (
  title: string,
  count: number,
  testCallback: () => void
) => {
  describe(`${title}`, () => {
    const origConsole = global.console;
    beforeAll(() => {
      // @ts-expect-error - missing other keys
      global.console = {
        error: jest.fn(),
        log: origConsole.log,
        warn: origConsole.warn,
      }; // used for test console errors
    });
    afterAll(() => {
      global.console = origConsole;
    });

    testCallback();

    it('should catch console.error calls', () => {
      // Error: Failed to initialize WebGL
      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalledTimes(count);
    });
  });
};
