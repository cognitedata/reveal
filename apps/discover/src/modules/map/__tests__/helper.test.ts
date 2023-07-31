import { convertPolygonToPoint, translateGeoType } from '../helper';

describe('map helpers', () => {
  it('convertPolygonToPoint', () => {
    const result = convertPolygonToPoint({
      type: 'Point',
      coordinates: [1.2312, 5.23432],
    });

    expect(result).toEqual({ coordinates: [1.2312, 5.23432], type: 'Point' });
  });

  it('translateGeoType', () => {
    expect(translateGeoType('')).toEqual('Polygon');
    expect(translateGeoType('polygon')).toEqual('Polygon');
  });
});
