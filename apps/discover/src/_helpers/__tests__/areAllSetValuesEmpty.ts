import { areAllSetValuesEmpty } from '../areAllSetValuesEmpty';

describe('areAllSetValuesEmpty', () => {
  it('should detect empty values', () => {
    expect(areAllSetValuesEmpty({ test: [], test1: [], test2: [] })).toEqual(
      true
    );
  });

  it('should handle nothing', () => {
    expect(areAllSetValuesEmpty({})).toEqual(true);
  });

  it('should detect a full entry', () => {
    expect(
      areAllSetValuesEmpty({
        test: [],
        test1: [],
        test2Full: [{ something: true }],
      })
    ).toEqual(false);
  });
});
