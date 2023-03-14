import { getTimeseriesFilterUnit } from '../getTimeseriesFilterUnit';

const testArray = ['test value 1', 'test value 2', 'test value 3'];
describe('getTimeseriesFilterUnit', () => {
  it('should return expected output', () => {
    expect(getTimeseriesFilterUnit(testArray)).toEqual(testArray);
  });

  it('should return input value inside an array', () => {
    expect(getTimeseriesFilterUnit(testArray[0])).toEqual([testArray[0]]);
  });

  it('should return undefined', () => {
    expect(getTimeseriesFilterUnit()).toBeUndefined();
  });
});
