import { sandbox } from '@cognite/testing';
import { log } from '../log';

jest.mock('../env', () => ({
  isDevelopment: true,
}));

describe('log', () => {
  it('basic log', () => {
    const stub = sandbox.stub(console, 'log');
    log('test log', [], 1);
    expect(stub.lastCall.args).toEqual(['test log']);
  });

  it('basic warn', () => {
    const stub = sandbox.stub(console, 'warn');
    log('test warn', [], 2);
    expect(stub.lastCall.args).toEqual(['test warn']);
  });

  it('basic error', () => {
    const stub = sandbox.stub(console, 'error');
    log('test error');
    expect(stub.lastCall.args).toEqual(['test error']);
  });

  it('array error', () => {
    const stub = sandbox.stub(console, 'error');
    log('array error', ['test', 'test2']);
    expect(stub.lastCall.args).toEqual(['array error', 'test', 'test2']);
  });

  it('object error', () => {
    const stub = sandbox.stub(console, 'error');
    // disable checking here because type is not right in log.ts
    // we we need to test this case where we pass an object instead of an array.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    log<{ [s: string]: boolean }>('object error', { test: true, test2: false });
    expect(stub.lastCall.args).toEqual([
      'object error',
      { test: true, test2: false },
    ]);
  });
});
