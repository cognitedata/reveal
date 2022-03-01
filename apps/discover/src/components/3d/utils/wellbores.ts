import get from 'lodash/get';

import { IWellBore } from '@cognite/node-visualizer';

import { Well, Wellbore } from 'modules/wellSearch/types';

export const mapWellboresTo3D = (wells: Well[]): Partial<IWellBore>[] => {
  return ([] as Wellbore[]).concat(
    ...wells
      .filter((row) => row.wellbores)
      .map((row) =>
        row.wellbores
          ? row.wellbores.map((wellbore) => ({
              ...wellbore,
              metadata: {
                ...(wellbore.metadata || {}),
                elevation_value_unit: get(row, 'datum.unit', ''),
                elevation_value: get(row, 'datum.value', ''),
                elevation_type: 'KB',
                bh_x_coordinate: get(row, 'wellhead.x', ''),
                bh_y_coordinate: get(row, 'wellhead.y', ''),
              },
              id: String(wellbore.id),
              parentId: String(wellbore.wellId),
            }))
          : []
      )
  );
};
