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
                elevation_value_unit: wellbore.datum?.unit || '',
                elevation_value: String(wellbore.datum?.value || ''),
                elevation_type: wellbore.datum?.reference || 'KB',
                bh_x_coordinate: String(row.wellhead?.x || ''),
                bh_y_coordinate: String(row.wellhead?.y || ''),
              },
              id: String(wellbore.id),
              parentId: String(wellbore.wellId),
            }))
          : []
      )
  );
};
