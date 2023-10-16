import { InternalFilters } from '../../../types';
import { mergeInternalFilters } from '../mergeInternalFilters';

describe('mergeInternalFilters', () => {
  const objectFilter: InternalFilters = {
    sources: [
      { label: 'Source 1', value: 'Source 1' },
      { label: 'Source 2', value: 'Source 2' },
    ],
    type: 'Type 1',
    subtype: 'Subtype 1',
  };

  const sourceFilter: InternalFilters = {
    sources: [{ label: 'Source 3', value: 'Source 3' }],
    type: 'Type 2',
    metadata: [{ key: 'Metadata key', value: 'Metadata value' }],
  };

  it('should merge internal filters correctly', () => {
    const expectedResult: InternalFilters = {
      sources: [
        { label: 'Source 1', value: 'Source 1' },
        { label: 'Source 2', value: 'Source 2' },
        { label: 'Source 3', value: 'Source 3' }, // Source value should be merged with object value
      ],
      type: 'Type 2', // Object value should be over-written by the source value
      subtype: 'Subtype 1', // Object value should remain same since no source value specified
      metadata: [{ key: 'Metadata key', value: 'Metadata value' }], // Source value should be merged since no object value specified
    };

    const result = mergeInternalFilters(objectFilter, sourceFilter);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return object filter if source filter is empty', () => {
    expect(mergeInternalFilters(objectFilter, {})).toStrictEqual(objectFilter);
  });

  it('should return source filter if object filter is empty', () => {
    expect(mergeInternalFilters({}, sourceFilter)).toStrictEqual(sourceFilter);
  });

  it('should return empty f both object and source filters are empty', () => {
    expect(mergeInternalFilters({}, {})).toStrictEqual({});
  });
});
