import { WellInternal } from 'domain/wells/well/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { IWellBore } from '@cognite/node-visualizer';

export const mapWellboresTo3D = (
  wells: WellInternal[]
): Partial<IWellBore>[] => {
  return ([] as WellboreInternal[]).concat(
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
              parentId: String(wellbore.wellMatchingId),
            }))
          : []
      )
  );
};
