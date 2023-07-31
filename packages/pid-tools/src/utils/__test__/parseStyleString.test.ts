import parseStyleString from '../parseStyleString';

describe('parseStyleString', () => {
  test('Basic', () => {
    const style = parseStyleString(
      'fill:#000000;stroke:#000000;stroke-width:1'
    );

    expect(Object.keys(style)).toEqual(['fill', 'stroke', 'stroke-width']);
    expect(style.fill).toEqual('#000000');
    expect(style.stroke).toEqual('#000000');
    expect(style['stroke-width']).toEqual('1');
  });
});
