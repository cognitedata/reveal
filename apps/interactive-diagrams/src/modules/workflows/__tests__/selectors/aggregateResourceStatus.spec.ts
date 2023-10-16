import { aggregateResourceStatus } from '../../selectors';

describe('aggregateResourceStatus', () => {
  it('should correctly aggregate a single status object', () => {
    const resourceStatuses = [{ done: true, loading: false, error: false }];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: true, loading: false, error: false });
  });

  it('should correctly aggregate statuses when all are "done"', () => {
    const resourceStatuses = [
      { done: true, loading: false, error: false },
      { done: true, loading: false, error: false },
      { done: true, loading: false, error: false },
    ];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: true, loading: false, error: false });
  });

  it('should correctly aggregate statuses when all are "loading"', () => {
    const resourceStatuses = [
      { done: false, loading: true, error: false },
      { done: false, loading: true, error: false },
      { done: false, loading: true, error: false },
    ];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: false, loading: true, error: false });
  });

  it('should correctly aggregate statuses when all are "error"', () => {
    const resourceStatuses = [
      { done: false, loading: false, error: true },
      { done: false, loading: false, error: true },
      { done: false, loading: false, error: true },
    ];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: false, loading: false, error: true });
  });

  it('should correctly aggregate statuses when some are "done" & some are "loading"', () => {
    const resourceStatuses = [
      { done: true, loading: false, error: false },
      { done: false, loading: true, error: false },
      { done: true, loading: false, error: false },
    ];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: false, loading: true, error: false });
  });

  it('should correctly aggregate statuses when some are "error"', () => {
    const resourceStatuses = [
      { done: true, loading: false, error: false },
      { done: false, loading: false, error: true },
      { done: true, loading: false, error: false },
    ];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: false, loading: false, error: true });
  });

  it('should correctly aggregate statuses when there are mixed statuses', () => {
    const resourceStatuses = [
      { done: true, loading: false, error: false },
      { done: false, loading: true, error: false },
      { done: false, loading: false, error: true },
    ];
    const result = aggregateResourceStatus(resourceStatuses);
    expect(result).toEqual({ done: false, loading: true, error: true });
  });
});
