import { getUpdatedValue } from 'src/store/thunks/Files/updateBulk';

describe('Test getUpdatedValue', () => {
  test('If unsavedValue empty expected value should not change', () => {
    const unsavedValue = undefined;
    const expectedValue = undefined;
    expect(getUpdatedValue({ unsavedValue })).toStrictEqual(expectedValue);
  });

  test("If unsavedValue '' source should set to null", () => {
    const unsavedValue = '';
    const expectedValue = { setNull: true };
    expect(getUpdatedValue({ unsavedValue })).toStrictEqual(expectedValue);
  });

  test('If unsavedValue defined source should set to new value', () => {
    const unsavedValue = 'New Value';
    const expectedValue = { set: unsavedValue };
    expect(getUpdatedValue({ unsavedValue })).toStrictEqual(expectedValue);
  });
});
