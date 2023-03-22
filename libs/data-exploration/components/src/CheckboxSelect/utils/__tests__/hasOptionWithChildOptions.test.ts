import { hasOptionWithChildOptions } from '../hasOptionWithChildOptions';

describe('NestedFilter/hasOptionWithChildOptions', () => {
  it('should return true', () => {
    expect(
      hasOptionWithChildOptions([
        { value: 'parent', options: [{ value: 'child' }] },
      ])
    ).toBeTruthy();

    expect(
      hasOptionWithChildOptions([
        { value: 'parent1' },
        { value: 'parent2', options: [{ value: 'child' }] },
      ])
    ).toBeTruthy();
  });

  it('should return false', () => {
    expect(hasOptionWithChildOptions([])).toBeFalsy();

    expect(
      hasOptionWithChildOptions([{ value: 'parent1' }, { value: 'parent2' }])
    ).toBeFalsy();
  });
});
