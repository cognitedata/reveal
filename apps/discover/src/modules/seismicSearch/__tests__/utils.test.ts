import {
  average,
  getSlice,
  getStandardDeviation,
  processSegyHeader,
} from '../utils';

describe('processSegyHeader', () => {
  it('should be ok empty', () => {
    expect(
      processSegyHeader({
        meta: {
          fileId: '',
          header: '',
          rawHeader: '',
        },
      })
    ).toEqual({ meta: { fileId: '', header: '', rawHeader: '' } });
  });

  it('should be good', () => {
    const processed = processSegyHeader({
      meta: {
        fileId: '123',
        header: 'C01boss',
        rawHeader: 'C01boss',
      },
    });
    expect(processed.meta?.fileId).toEqual('123');
    expect(processed.meta?.header).toContain('\nC01 boss');
    expect(processed.meta?.rawHeader).toEqual('C01boss');
  });

  it('should return avarage', () => {
    const result = average([100, 200, 300]);
    expect(result).toEqual(200);
  });

  it('should return standard deviation', () => {
    const result = getStandardDeviation([{ traceList: [100, 200, 300] }], 200);
    expect(result).toEqual(81.64965809277261);
  });

  it('should return slice', () => {
    const result = getSlice([
      { traceList: [100, 200, 300], traceHeader: '1321' },
    ]);
    expect(result.standardDeviation).toEqual(216.02468994692867);
    expect(result.mean).toEqual(0);
  });
});
