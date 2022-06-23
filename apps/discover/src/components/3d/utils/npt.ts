import { NptInternal } from 'domain/wells/npt/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import flatten from 'lodash/flatten';
import { convertDistance } from 'utils/units/convertDistance';

import { INpt } from '@cognite/node-visualizer';

import { FEET } from 'constants/units';

const convertMeasureDepthToFeet = (
  measuredDepth?: NptInternal['measuredDepth']
) => {
  if (!measuredDepth) {
    return undefined;
  }

  return convertDistance(measuredDepth, FEET);
};

export const mapNPTTo3D = (events?: NptInternal[]): Partial<INpt>[] => {
  if (!events) {
    return [];
  }

  const groupedEvents = groupByWellbore(events);

  return flatten(
    Object.keys(groupedEvents).map((wellboreId) => {
      const wellboreNptEvents = groupedEvents[wellboreId];
      if (!wellboreNptEvents) {
        console.warn('Missing NPT event', { wellboreId });
        return [];
      }
      return wellboreNptEvents.map(
        ({ wellboreAssetExternalId, subtype, description, measuredDepth }) => {
          return {
            assetIds: [wellboreAssetExternalId],
            subtype,
            description,
            metadata: {
              npt_md: `${convertMeasureDepthToFeet(measuredDepth)?.value}`,
              description: '',
            },
          };
        }
      );
    })
  );
};
