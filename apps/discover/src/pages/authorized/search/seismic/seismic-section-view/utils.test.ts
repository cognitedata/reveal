import {
  getBoundryRange,
  getDiffOnZoom,
  getMean,
  getStandardDeviation,
  getValidDiffOnPan,
  getValidDiffOnZoom,
  traceToRGB,
} from './utils';

describe('Seismic Section View Utils', () => {
  it('should return common boundry range', () => {
    const props = [
      {
        id: '1',
        iline: {
          min: 0,
          max: 100,
        },
        xline: {
          min: 0,
          max: 100,
        },
      },
      {
        id: '2',
        iline: {
          min: 10,
          max: 50,
        },
        xline: {
          min: 10,
          max: 200,
        },
      },
    ];
    expect(getBoundryRange(props)).toEqual({
      id: 'boundry',
      iline: { max: 100, min: 0 },
      xline: { max: 200, min: 0 },
    });
  });

  it('should return canvas top right position difference on zooming', () => {
    expect(getDiffOnZoom([1, 10], 2)).toEqual([-0.25, -2.5]);
  });

  it('should return valid top left position of canvas on zooming', () => {
    expect(getValidDiffOnZoom([1, 10], [1, 10], [1, 10], 2)).toEqual([0, 0]);
  });

  it('should return valid top left position of canvas on panning', () => {
    expect(getValidDiffOnPan([1, 10], [1, 10], [1, 10], 2)).toEqual([0, 0]);
  });

  it('should Convert trace point to rgba value', () => {
    expect(traceToRGB(10, 5, 5, 'greyscale', [0, 100])).toEqual([
      255, 255, 255, 255,
    ]);
  });

  it('should return mean value from number list', () => {
    expect(getMean([10, 20, 30])).toEqual(20);
  });

  it('should return standard deviation value from number list', () => {
    const numberList = [10, 10, 10];
    const mean = getMean(numberList);
    expect(getStandardDeviation(numberList, mean)).toEqual(0);
  });
});
