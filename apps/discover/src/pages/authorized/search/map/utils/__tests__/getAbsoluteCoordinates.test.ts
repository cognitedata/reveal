import { getAbsoluteCoordinates } from '../getAbsoluteCoordinates';

describe('getAbsoluteCoordinates', () => {
  it('should get absolute coordinates', () => {
    const lat = -90.36048889160156;
    const lon = 27.248754185757434;

    const coordinates = getAbsoluteCoordinates(-90.36285436332768, [lat, lon]);
    expect(lat).toEqual(coordinates[0]);

    const coordinates2 = getAbsoluteCoordinates(190.3628543633276, [lat, lon]);
    expect(lat + 360).toEqual(coordinates2[0]);
  });
});
