import { createSandbox } from 'sinon';

import { PerfMetrics } from './index';

const perfHookPerformanceObserver = require('perf_hooks').PerformanceObserver;
const perfHookPerformance = require('perf_hooks').performance;

const sandbox = createSandbox();

describe('PerfMetrics', () => {
  beforeEach(() => {
    global.PerformanceObserver = perfHookPerformanceObserver;
    global.performance = perfHookPerformance;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ test: 100 }),
      })
    ) as jest.Mock;
    global.Headers = jest.fn(() => ({
      set: jest.fn(),
    })) as jest.Mock;
    jest.spyOn(performance, 'mark');
    jest.spyOn(performance, 'measure');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not run any performance marker when Perfmetrics is not initialized', () => {
    PerfMetrics.trackPerfStart('test');
    expect(performance.mark).toHaveBeenCalledTimes(0);
  });

  it('should not run any performance marker when Perfmetrics is disabled', () => {
    PerfMetrics.initialize('http://example.com', 'test', 'project');
    PerfMetrics.trackPerfStart('test');
    expect(performance.mark).toHaveBeenCalledTimes(0);
  });

  it('should run the internal performance marker when event tracking starts', () => {
    PerfMetrics.initialize('http://example.com', 'test', 'project');
    PerfMetrics.enable();
    PerfMetrics.trackPerfStart('test');
    expect(performance.mark).toHaveBeenCalledWith('test');
    expect(performance.mark).toHaveBeenCalledTimes(1);
  });

  it('should run the internal performance measure marker when event tracking ends', () => {
    PerfMetrics.initialize('http://example.com', 'test', 'project');
    PerfMetrics.enable();
    PerfMetrics.trackPerfStart('test');
    return new Promise((resolve) => {
      setTimeout(() => {
        PerfMetrics.trackPerfEnd('test');
        setTimeout(() => {
          resolve(true);
        }, 500);
      }, 500);
    }).then((_output) => {
      expect(performance.measure).toHaveBeenCalledTimes(1);
    });
  });

  it('should post results to the API', () => {
    PerfMetrics.initialize('http://example.com', 'test', 'project');
    PerfMetrics.enable();
    PerfMetrics.trackPerfStart('test');
    return new Promise((resolve) => {
      setTimeout(() => {
        PerfMetrics.trackPerfEnd('test');
        setTimeout(() => {
          resolve(true);
        }, 1000);
      }, 500);
    }).then((_output) => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/metrics',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
