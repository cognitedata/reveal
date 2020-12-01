import { getColor, availableColors, createColorGetter } from './colors';

describe('Colors', () => {
  it('handles numbers', () => expect(getColor(1)).toBe(availableColors[1]));

  it('handles negative numbers', () =>
    expect(getColor(-1)).toBe(availableColors[availableColors.length - 1]));
});

describe('Stateful colors', () => {
  it('gives incrementing color from list', () => {
    const getNextColor = createColorGetter();

    expect(getNextColor()).toBe(availableColors[0]);
    expect(getNextColor()).toBe(availableColors[1]);
    expect(getNextColor()).toBe(availableColors[2]);
    expect(getNextColor()).toBe(availableColors[3]);
    expect(getNextColor()).toBe(availableColors[4]);
    expect(getNextColor()).toBe(availableColors[5]);
    expect(getNextColor()).toBe(availableColors[6]);
    expect(getNextColor()).toBe(availableColors[7]);
    expect(getNextColor()).toBe(availableColors[8]);
  });
});
