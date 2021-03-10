import { setupUserTracking } from './userTracking';

const mockFn = jest.fn();
jest.mock('@sentry/browser', () => {
  return { init: () => mockFn() };
});

describe('Sentry test', () => {
  beforeAll(() => {
    // @ts-ignore
    delete global.location;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should not run on localhost', () => {
    // @ts-ignore
    global.location = { href: 'https://localhost:3000', hostname: 'localhost' };
    setupUserTracking();
    expect(mockFn).toBeCalledTimes(0);
  });

  it('should not run on dev', () => {
    // @ts-ignore
    global.location = {
      href: 'https://dev.fusion.cogniteapp.com',
      hostname: 'dev.fusion.cogniteapp.com',
    };
    setupUserTracking();
    expect(mockFn).toBeCalledTimes(0);
  });

  it('should run in pr previews', () => {
    // @ts-ignore
    global.location = {
      href: 'https:///pr-318.cdf-3d-management.preview.cogniteapp.com',
      hostname: 'pr-318.cdf-3d-management.preview.cogniteapp.com',
    };
    setupUserTracking();
    expect(mockFn).toBeCalledTimes(1);
  });

  it('should run in staging', async () => {
    // @ts-ignore
    global.location = {
      href: 'https://staging.fusion.cognite.com',
      hostname: 'staging.fusion.cognite.com',
    };
    await setupUserTracking();
    expect(mockFn).toBeCalledTimes(1);
  });

  it('should run in next-release', async () => {
    // @ts-ignore
    global.location = {
      href: 'https://next-release.fusion.cognite.com',
      hostname: 'next-release.fusion.cognite.com',
    };
    await setupUserTracking();
    expect(mockFn).toBeCalledTimes(1);
  });

  it('should run in prod', async () => {
    // @ts-ignore
    global.location = {
      href: 'https://fusion.cognite.com',
      hostname: 'fusion.cognite.com',
    };
    await setupUserTracking();
    expect(mockFn).toBeCalledTimes(1);
  });
});
