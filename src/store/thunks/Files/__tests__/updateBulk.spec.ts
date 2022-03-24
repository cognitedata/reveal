import { getUpdatedValue } from 'src/store/thunks/Files/updateBulk';

describe('Test getUpdatedSource', () => {
  test('If unsavedSource undefined source should not change', () => {
    const unsavedValue = undefined;
    const expectedValue = undefined;
    expect(getUpdatedValue({ unsavedValue })).toStrictEqual(expectedValue);
  });

  test("If unsavedSource '' source should set to null", () => {
    const unsavedValue = '';
    const expectedValue = { setNull: true };
    expect(getUpdatedValue({ unsavedValue })).toStrictEqual(expectedValue);
  });

  test('If unsavedSource defined source should set to new value', () => {
    const unsavedValue = 'New Source';
    const expectedValue = { set: unsavedValue };
    expect(getUpdatedValue({ unsavedValue })).toStrictEqual(expectedValue);
  });
});
