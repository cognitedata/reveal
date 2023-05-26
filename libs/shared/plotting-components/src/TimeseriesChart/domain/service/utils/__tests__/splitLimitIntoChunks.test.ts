import { splitLimitIntoChunks } from '../splitLimitIntoChunks';

describe('splitLimitIntoChunks', () => {
  it('should split the total into equal chunks when divisible', () => {
    const total = 10;
    const chunkSize = 2;
    const expected = [2, 2, 2, 2, 2];
    const result = splitLimitIntoChunks(total, chunkSize);
    expect(result).toEqual(expected);
  });

  it('should split the total into equal chunks when divisible with different chunk size', () => {
    const total = 12;
    const chunkSize = 3;
    const expected = [3, 3, 3, 3];
    const result = splitLimitIntoChunks(total, chunkSize);
    expect(result).toEqual(expected);
  });

  it('should split the total into chunks with remainder when not divisible', () => {
    const total = 13;
    const chunkSize = 4;
    const expected = [4, 4, 4, 1];
    const result = splitLimitIntoChunks(total, chunkSize);
    expect(result).toEqual(expected);
  });

  it('should return an empty array when total is 0', () => {
    const total = 0;
    const chunkSize = 4;
    const expected: number[] = [];
    const result = splitLimitIntoChunks(total, chunkSize);
    expect(result).toEqual(expected);
  });

  it('should return an array with a single chunk when chunkSize is greater than total', () => {
    const total = 5;
    const chunkSize = 10;
    const expected = [5];
    const result = splitLimitIntoChunks(total, chunkSize);
    expect(result).toEqual(expected);
  });
});
