import { calculateGranularity } from '../calculateGranularity';

describe('calculateGranularity', () => {
  it('should return `s`', () => {
    const result = calculateGranularity([1, 3], 20);
    expect(result).toEqual('s');
  });

  it('should return expected value in `s`', () => {
    const result = calculateGranularity([1673235765000, 1673236665000], 20);
    expect(result).toEqual('46s');
  });

  it('should return expected value in `m`', () => {
    const result = calculateGranularity([0, 1200000], 20);
    expect(result).toEqual('2m');
  });

  it('should return expected value in `h`', () => {
    const result = calculateGranularity([1673149968000, 1673236368000], 20);
    expect(result).toEqual('2h');
  });

  it('should return expected value in `day`', () => {
    const result = calculateGranularity([1610164009000, 1673236009000], 100);
    expect(result).toEqual('8day');
  });

  it('should return `day`', () => {
    const result = calculateGranularity([1515470403000, 1783336803000], 20);
    expect(result).toEqual('day');
  });
});
