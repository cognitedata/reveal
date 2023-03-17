import { isNumeric } from '../number';

describe('isNumeric', () => {
  it('Should return correct results', () => {
    expect(isNumeric('12')).toBeTruthy();
    expect(isNumeric('test')).toBeFalsy();
    expect(isNumeric('123bc')).toBeFalsy();
    expect(isNumeric('')).toBeFalsy();
  });
});
