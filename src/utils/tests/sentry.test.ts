import { setupSentry } from '../sentry';

const mockFn = jest.fn();
jest.mock('@sentry/browser', () => {
  return { init: () => mockFn() };
});

describe('Sentry test', () => {
  beforeAll(() => {
    delete global.location;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should not run on localhost', () => {
    // @ts-ignore
    global.location = { href: 'https://localhost:3000', hostname: 'localhost' };
    setupSentry();
    expect(mockFn).toBeCalledTimes(0);
  });

  it('should not run on dev', () => {
    // @ts-ignore
    global.location = {
      href: 'https://dev.fusion.cogniteapp.com',
      hostname: 'dev.fusion.cogniteapp.com',
    };
    setupSentry();
    expect(mockFn).toBeCalledTimes(0);
  });

  it('should run in staging', async () => {
    // @ts-ignore
    global.location = {
      href: 'https://staging.fusion.cognite.com',
      hostname: 'staging.fusion.cognite.com',
    };
    await setupSentry();
    expect(mockFn).toBeCalledTimes(1);
  });

  it('should run in prod', async () => {
    // @ts-ignore
    global.location = {
      href: 'https://fusion.cognite.com',
      hostname: 'fusion.cognite.com',
    };
    await setupSentry();
    expect(mockFn).toBeCalledTimes(1);
  });
});
