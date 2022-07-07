import { getWellGroups } from '__test-utils/fixtures/well/groups';

import { isChildShouldUpdateWith } from '../isChildShouldUpdateWith';

describe('isChildShouldUpdateWith', () => {
  it('should return empty result with empty input', () => {
    expect(isChildShouldUpdateWith([], '', 'field', 'blocks')).toEqual({});
    expect(isChildShouldUpdateWith('', '', 'field', 'blocks')).toEqual({});
    expect(isChildShouldUpdateWith(['test'], '', 'field', 'blocks')).toEqual(
      {}
    );
  });

  it('should return expected result with empty selected values', () => {
    const result = isChildShouldUpdateWith(
      [],
      '',
      'field',
      'blocks',
      getWellGroups()
    );

    expect(result).toEqual({ isUpdate: true, value: [] });
  });

  it('should return expected result with valid input', () => {
    const result = isChildShouldUpdateWith(
      ['Achelous', 'Adad'],
      ['Ganymede', 'Callisto'],
      'field',
      'blocks',
      getWellGroups()
    );

    expect(result).toEqual({ isUpdate: false, value: undefined });
  });

  it('should return expected result with', () => {
    const testField = 'Callisto';
    const wellGroups = getWellGroups();
    const testBlock =
      Object.keys(wellGroups.blocks).find(
        (key) => wellGroups.blocks[key].field === testField
      ) || '';

    const result = isChildShouldUpdateWith(
      ['Achelous', 'Adad', testBlock],
      [testField],
      'field',
      'blocks',
      getWellGroups()
    );

    expect(result).toEqual({ isUpdate: true, value: [testBlock] });
  });
});
