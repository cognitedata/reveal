import { MapDataSource } from 'modules/map/types';

import { getAbsoluteCoordinates } from '../getAbsoluteCoordinates';
import { setSourceProperties } from '../setSourceProperties';

describe('Map utils', () => {
  it('should set source properties', () => {
    const sources: MapDataSource[] = [
      {
        id: 'Well_Heads',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              geometry: { type: 'Point', coordinates: [] },
              properties: { id: 32508289116008 },
              type: 'Feature',
            },
          ],
        },
      },
    ];
    const updatedSources = setSourceProperties(
      sources,
      'Well_Heads',
      'highlight',
      'true'
    );
    expect(updatedSources[0].data.features[0].properties.highlight).toEqual(
      'true'
    );
  });

  it('should get absolute coordinates', () => {
    const lat = -90.36048889160156;
    const lon = 27.248754185757434;

    const coordinates = getAbsoluteCoordinates(-90.36285436332768, [lat, lon]);
    expect(lat).toEqual(coordinates[0]);

    const coordinates2 = getAbsoluteCoordinates(190.3628543633276, [lat, lon]);
    expect(lat + 360).toEqual(coordinates2[0]);
  });
});
