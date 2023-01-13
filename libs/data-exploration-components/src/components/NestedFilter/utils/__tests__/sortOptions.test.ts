import { OptionType, SortDirection } from '../../types';
import { sortOptions } from '../sortOptions';

describe('NestedFilter/sortOptions', () => {
  const options: Pick<OptionType, 'label' | 'value'>[] = [
    { value: 'option2' },
    { value: 'option1' },
    { label: 'option4', value: 'value' }, // This is to test if label is considered when available.
    { value: 'option3' },
  ];

  it('should sort ascending', () => {
    expect(sortOptions(options)).toEqual([
      { value: 'option1' },
      { value: 'option2' },
      { value: 'option3' },
      { label: 'option4', value: 'value' },
    ]);

    expect(sortOptions(options, SortDirection.Ascending)).toEqual([
      { value: 'option1' },
      { value: 'option2' },
      { value: 'option3' },
      { label: 'option4', value: 'value' },
    ]);
  });

  it('should sort descending', () => {
    expect(sortOptions(options, SortDirection.Descending)).toEqual([
      { label: 'option4', value: 'value' },
      { value: 'option3' },
      { value: 'option2' },
      { value: 'option1' },
    ]);
  });
});
