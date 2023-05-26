import { OptionType } from '../../types';
import { filterOptions } from '../filterOptions';

describe('NestedFilter/filterOptions', () => {
  const options: Pick<OptionType, 'label' | 'value'>[] = [
    { value: 'product_type' },
    { value: 'asset_external_id' },
    { label: 'prefix', value: 'value' }, // This is to test if label is considered when available.
    { value: 'isTextOnly' },
  ];

  it('should filter options correctly', () => {
    expect(filterOptions(options, '')).toEqual(options);

    expect(filterOptions(options, 'e')).toEqual(options);

    expect(filterOptions(options, 'pr')).toEqual([
      { value: 'product_type' },
      { label: 'prefix', value: 'value' },
    ]);

    expect(filterOptions(options, 'id')).toEqual([
      { value: 'asset_external_id' },
    ]);

    expect(filterOptions(options, 'ct')).toEqual([{ value: 'product_type' }]);

    expect(filterOptions(options, 'prefix')).toEqual([
      { label: 'prefix', value: 'value' },
    ]);
  });
});
