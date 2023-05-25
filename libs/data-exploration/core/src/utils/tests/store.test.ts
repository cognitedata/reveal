import { getCategoryValues } from '../store';

describe('getCategoryValues', () => {
  it('should separate the keys correctly into specific and common filters', () => {
    const common = { externalIdPrefix: 'ABC', createdTime: new Date() };
    const specific = { isStep: true };
    expect(
      getCategoryValues({
        ...common,
        ...specific,
      })
    ).toStrictEqual({ common, specific });
  });

  it('should transfer the unknown keys into specific key', () => {
    const common = { externalIdPrefix: 'ABC', createdTime: new Date() };
    const specific = { abc: true };
    expect(
      getCategoryValues({
        ...common,
        ...specific,
      }).specific
    ).toStrictEqual(specific);
  });
});
