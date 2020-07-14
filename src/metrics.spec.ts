import { createSandbox } from 'sinon';
import mixpanel from 'mixpanel-browser';

import { Metrics } from './index';
import { NoopDebugger, ConsoleDebugger } from './debuggers';

const sandbox = createSandbox();

const DEFAULT_PROPS = {
  applicationId: 'unknown-app',
  environment: 'test',
  releaseId: 'unknown-release',
  versionName: '0.0.0',
};

describe('Metrics', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should track simple event', () => {
    const stub = sandbox.stub(mixpanel, 'track');
    const metrics = Metrics.create('SimpleMetrics');
    const properties = { foo: 'bar', nested: { foo: 'bar' } };
    metrics.track('event', properties);

    expect(stub.lastCall.args).toEqual([
      'SimpleMetrics.event',
      { foo: 'bar', nested: { foo: 'bar' } },
      undefined,
    ]);
  });

  it('should merge class properties into track event', () => {
    const stub = sandbox.stub(mixpanel, 'track');
    const metrics = Metrics.create('SimpleMetrics', { go: 'ba' });
    const properties = { foo: 'bar' };
    metrics.track('event', properties);

    expect(stub.lastCall.args).toEqual([
      'SimpleMetrics.event',
      { foo: 'bar', go: 'ba' },
      undefined,
    ]);
  });

  it('should throw on init without mixpanelToken', () => {
    const initMetrics = () => {
      Metrics.init({} as any);
    };
    expect(initMetrics).toThrowError(
      new Error('Missing mixpanelToken parameter')
    );
  });

  it('should pass the correct config', () => {
    const initSpy = sandbox.spy(mixpanel, 'init');
    Metrics.init({ mixpanelToken: 'passedMixpanelToken' });
    expect(initSpy.lastCall.args).toMatchObject([
      'passedMixpanelToken',
      { persistence: 'localStorage' },
    ]);

    Metrics.init({
      mixpanelToken: 'passedMixpanelToken',
      persistence: 'cookie',
    });
    expect(initSpy.lastCall.args).toMatchObject([
      'passedMixpanelToken',
      { persistence: 'cookie' },
    ]);

    Metrics.init({
      mixpanelToken: 'passedMixpanelToken',
      // @ts-ignore
      persistence: 'bad-value',
    });
    expect(initSpy.lastCall.args).toMatchObject([
      'passedMixpanelToken',
      { persistence: 'localStorage' },
    ]);
  });

  it('should merge init properties into track event', () => {
    const trackEventStub = sandbox.stub(mixpanel, 'track');
    const initSpy = sandbox.spy(mixpanel, 'init');
    Metrics.init({ mixpanelToken: 'passedMixpanelToken', global: 'global' });
    const metrics = Metrics.create('SimpleMetrics', { go: 'ba' });
    const properties = { foo: 'bar' };
    metrics.track('event', properties);
    expect(trackEventStub.lastCall.args).toEqual([
      'SimpleMetrics.event',
      {
        ...DEFAULT_PROPS,
        foo: 'bar',
        go: 'ba',
        global: 'global',
      },
      undefined,
    ]);
  });

  it('Should console.warn if constructor is used directly', () => {
    const spy = jest.spyOn(console, 'warn');
    // @ts-ignore
    new Metrics('SimpleMetrics');
    expect(spy).toHaveBeenCalledWith(
      'new Metrics(..) has been deprecated; please use Metrics.create(..) instead.'
    );
  });

  describe('debugger functionality', () => {
    afterEach(() => {
      delete process.env.REACT_APP_DEBUG_METRICS;
    });

    it('should default to the no-op debugger', () => {
      Metrics.init({ mixpanelToken: 'fake-token' });
      expect(Metrics.DEBUGGER).toEqual(NoopDebugger);
    });

    it('should respect the debug param', () => {
      Metrics.init({ mixpanelToken: 'fake-token', debug: 'true' });
      expect(Metrics.DEBUGGER).toEqual(ConsoleDebugger);
    });

    it('should respect the debug env var', () => {
      process.env.REACT_APP_DEBUG_METRICS = 'true';
      Metrics.init({ mixpanelToken: 'fake-token' });
      expect(Metrics.DEBUGGER).toEqual(ConsoleDebugger);
    });

    it('should use a custom debugger', () => {
      const customDebugger = {
        isDebug: true,
        track: sandbox.stub(),
        stop: sandbox.stub(),
      };
      Metrics.init({
        mixpanelToken: 'fake-token',
        metricsDebugger: customDebugger,
      });
      expect(Metrics.DEBUGGER).toEqual(customDebugger);
    });

    it('should use a custom debugger if both are specified', () => {
      const customDebugger = {
        isDebug: true,
        track: sandbox.stub(),
        stop: sandbox.stub(),
      };
      Metrics.init({
        mixpanelToken: 'fake-token',
        metricsDebugger: customDebugger,
        debug: 'true',
      });
      expect(Metrics.DEBUGGER).toEqual(customDebugger);
    });

    it('should use a custom debugger if both are specified', () => {
      const customDebugger = {
        isDebug: true,
        track: sandbox.stub(),
        stop: sandbox.stub(),
      };
      Metrics.init({
        mixpanelToken: 'fake-token',
        metricsDebugger: customDebugger,
        debug: 'true',
      });
      const instance = Metrics.create('SomeClass', { base: true });
      instance.track('some-event', { prop: true, value: 3.5 });
      sandbox.assert.calledWithExactly(
        customDebugger.track,
        'SomeClass.some-event',
        {
          ...DEFAULT_PROPS,
          // The "global" prop comes from an earlier test case. We don't have
          // a way to tear it down.
          global: 'global',
          base: true,
          prop: true,
          value: 3.5,
        }
      );

      instance.start('some-timer', { starting: true }).stop({ stopping: true });
      sandbox.assert.calledWithExactly(
        customDebugger.stop,
        'SomeClass.some-timer',
        {
          ...DEFAULT_PROPS,
          // The "global" prop comes from an earlier test case. We don't have
          // a way to tear it down.
          global: 'global',
          base: true,
          starting: true,
          stopping: true,
        }
      );
    });
  });
});
