import { pickFilterDataByDefaultFilter } from '../pickFilterDataByDefaultFilter';

describe('pickFilterDataByDefaultFilter', () => {
  // Define a sample data array and a default filter for testing.
  const data = [
    { value: 'A', count: 1 },
    { value: 'B', count: 2 },
    { value: 'C', count: 3 },
    { value: 'D', count: 4 },
  ];

  const defaultFilter = {
    source: 'A',
  };

  it('should return the entire data if defaultFilterKey is undefined', () => {
    expect(pickFilterDataByDefaultFilter(data, defaultFilter, [])).toEqual(
      data
    );
  });

  it('should return filtered data based on the default filter', () => {
    const expectedFilteredData = [{ value: 'A', count: 1 }];
    expect(
      pickFilterDataByDefaultFilter(data, defaultFilter, 'source')
    ).toEqual(expectedFilteredData);
  });

  it('should return the entire data if defaultFilter value is undefined', () => {
    const invalidDefaultFilter = { sourceFile: undefined };
    expect(
      pickFilterDataByDefaultFilter(data, invalidDefaultFilter, 'sourceFile')
    ).toEqual(data);
  });

  it('should return the entire data if defaultFilter value is empty', () => {
    const invalidDefaultFilter = { sourceFile: '' };
    expect(
      pickFilterDataByDefaultFilter(data, invalidDefaultFilter, 'sourceFile')
    ).toEqual(data);
  });

  it('should handle an array of properties and return the filtered data', () => {
    const propertyArray = ['sourceFile', 'source'];
    const expectedFilteredData = [{ value: 'A', count: 1 }];
    expect(
      pickFilterDataByDefaultFilter(data, defaultFilter, propertyArray)
    ).toEqual(expectedFilteredData);
  });

  it('should return the entire data if property is an empty array', () => {
    expect(pickFilterDataByDefaultFilter(data, defaultFilter, [])).toEqual(
      data
    );
  });
});
