import { getHumanReadableFileSize } from './getHumanReadableFileSize';

describe('getHumanReadableFileSize fn', () => {
  it('returns string that ends with B', () => {
    expect(getHumanReadableFileSize(1)).toBe('1 B');
    expect(getHumanReadableFileSize(1023)).toBe('1023 B');
  });

  it('returns string with KB ending', () => {
    expect(getHumanReadableFileSize(1024)).toBe('1 kB');
    expect(getHumanReadableFileSize(4710)).toBe('4.6 kB');
  });

  it('returns string with MB ending', () => {
    expect(getHumanReadableFileSize(1024 ** 2)).toBe('1 MB');
    expect(getHumanReadableFileSize(190284710)).toBe('181.47 MB');
  });

  it('returns string with GB ending', () => {
    expect(getHumanReadableFileSize(1024 ** 3)).toBe('1 GB');
    expect(getHumanReadableFileSize(947190284710)).toBe('882.14 GB');
  });

  it('returns string with TB ending', () => {
    expect(getHumanReadableFileSize(1024 ** 4)).toBe('1 TB');
    expect(getHumanReadableFileSize(102947190284710)).toBe('93.63 TB');
  });
});
