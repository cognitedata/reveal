import {
  filterDistinctProperties,
  filterCommonProperties,
  reorder,
} from './utils';

describe('utils', () => {
  const propertyLists = [
    [
      { path: 'External Id', value: '1234', isSelected: false },
      { path: 'Name', value: 'Test Name', isSelected: false },
      { path: 'Description', value: 'Test Description', isSelected: false },
      { path: 'description', value: 'Duplicate field', isSelected: false },
      { path: 'Type', value: 'Pump', isSelected: false },
      { path: 'Pressure', value: '9000 PSI', isSelected: false },
    ],
    [
      { path: 'External Id', value: '1234', isSelected: false },
      { path: 'Name', value: 'Test Name', isSelected: false },
      { path: 'Type', value: 'Valve', isSelected: false },
      { path: 'Part number', value: '#123K41J', isSelected: false },
      { path: 'Temperature', value: '250C ', isSelected: false },
    ],
  ];

  describe('filterCommonProperties', () => {
    it('should filter properties present in all lists', () => {
      expect(filterCommonProperties(propertyLists)).toEqual([
        { path: 'External Id', value: '1234', isSelected: false },
        { path: 'Name', value: 'Test Name', isSelected: false },
        { path: 'Type', value: 'Pump', isSelected: false },
      ]);
    });
  });

  describe('filterDistinctProperties', () => {
    it('should filter properties not present in all lists', () => {
      expect(filterDistinctProperties(propertyLists)).toEqual([
        { path: 'Description', value: 'Test Description', isSelected: false },
        { path: 'Pressure', value: '9000 PSI', isSelected: false },
        { path: 'Part number', value: '#123K41J', isSelected: false },
        { path: 'Temperature', value: '250C ', isSelected: false },
      ]);
    });
  });

  describe('redorder', () => {
    it('should reorder the list', () => {
      expect(reorder([1, 2, 3, 4, 5], 0, 4)).toEqual([2, 3, 4, 5, 1]);
      expect(reorder([1, 2, 3, 4, 5], 4, 0)).toEqual([5, 1, 2, 3, 4]);
      expect(reorder([1, 2, 3, 4, 5], 1, 3)).toEqual([1, 3, 4, 2, 5]);
    });
  });
});
