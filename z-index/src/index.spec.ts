import { createLayers } from './index';

describe('createLayers', () => {
  const layers = ['TOP', 'MIDDLE', 'BOTTOM'] as const;
  it('handles the default case', () => {
    expect(createLayers(layers)).toEqual({
      TOP: 120,
      MIDDLE: 110,
      BOTTOM: 100,
    });
  });

  it('handles changing the base', () => {
    expect(
      createLayers<typeof layers[number]>(layers, { base: 0 })
    ).toEqual({
      TOP: 20,
      MIDDLE: 10,
      BOTTOM: 0,
    });
  });

  it('handles changing the delta', () => {
    expect(
      createLayers<typeof layers[number]>(layers, { delta: 1 })
    ).toEqual({
      TOP: 102,
      MIDDLE: 101,
      BOTTOM: 100,
    });
  });
});
