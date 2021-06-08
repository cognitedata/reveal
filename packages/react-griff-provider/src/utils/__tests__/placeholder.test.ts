import { placeholder } from '../placeholder';

describe('placeholder tests', () => {
  it('Should make placeholder', () => {
    const ph = placeholder(23, 1000);
    expect(ph.placeholder).toBe(true);
    expect(ph[0]).toEqual(23);
    expect(ph[1]).toEqual(1000);
  });
});
