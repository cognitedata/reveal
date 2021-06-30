import {
  getColor,
  availableColors,
  createColorGetter,
  hexToRGBA,
} from './colors';

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

describe('Hex to RGBA', () => {
  it('handles 6 char hex', () => {
    const rgba = hexToRGBA('#FFFFFF');

    expect(rgba).toBe(`rgba(255, 255, 255, 1)`);
  });

  it('handles 3 char hex', () => {
    const rgba = hexToRGBA('#FFF');

    expect(rgba).toBe(`rgba(255, 255, 255, 1)`);
  });

  it('handle alpha value', () => {
    const rgba = hexToRGBA('#FFF333', 0.5);
    expect(rgba).toBe('rgba(255, 243, 51, 0.5)');
  });

  it('does not handle hex without #', () => {
    const rgba = hexToRGBA('FFF');
    expect(rgba).toBe(null);
  });
});
