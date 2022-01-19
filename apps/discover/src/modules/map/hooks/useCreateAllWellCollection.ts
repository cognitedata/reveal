import {
  feature as turfFeature,
  Feature,
  featureCollection,
  Geometry,
} from '@turf/helpers';
import reduce from 'lodash/reduce';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellAllGeometryQuery } from 'modules/api/well/useWellQuery';
import { WELL_MARKER } from 'pages/authorized/search/map/constants';

/**
 * This creates the data source for all the wells on the map
 * the data is from discover-api all well geometry endpoint
 */
export const useCreateAllWellCollection = ({
  selectedWellIds,
  anotherReasonToBlur,
}: {
  selectedWellIds: Record<string, boolean>;
  anotherReasonToBlur?: boolean;
}) => {
  const { data } = useWellAllGeometryQuery();

  const wellSource: Feature[] = useDeepMemo(() => {
    return reduce(
      data?.features,
      (results, well) => {
        // console.log('Checking well:', well);
        if (well?.geometry) {
          const isSelected =
            well.properties?.id && selectedWellIds[well.properties?.id];

          const wellFeature = turfFeature(well.geometry, {
            id: well.properties?.id,
            highlight: 'true',
            iconType: WELL_MARKER,
            isSelected: isSelected ? 'true' : 'false',
            isBlurred: isSelected ? false : anotherReasonToBlur,
            customLayer: true,
          }) as Feature<Geometry>;

          results.push(wellFeature);
        }

        return results;
      },
      [] as Feature<Geometry>[]
    );
  }, [data, selectedWellIds, anotherReasonToBlur]);

  const wellCollection = useDeepMemo(
    () => featureCollection(wellSource),
    [wellSource]
  );

  return wellCollection;
};
