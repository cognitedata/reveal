import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import invert from 'lodash/invert';
import set from 'lodash/set';

import { ProjectConfigWellsTrajectoryQueries } from '@cognite/discover-api-types';

import { wellSearchService } from 'modules/wellSearch/service';
import { WellboreId } from 'modules/wellSearch/types';

import { WellSequenceData } from '../types';

import { useWellInspectWellboreAssetIdMap } from './useWellInspectIdMap';

export const useFetchSequenceData = () => {
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
  const wellboreAssetIdReverseMap = invert(wellboreAssetIdMap);

  return async (
    wellboreIds: WellboreId[],
    filters: ProjectConfigWellsTrajectoryQueries
  ) => {
    const fetchedSequenceData: WellSequenceData = {};

    const sequences = await wellSearchService.getSequenceByWellboreIds(
      wellboreIds.map((id) => wellboreAssetIdMap[id]),
      filters
    );

    const sequenceSets = sequences.map((sequence) => ({
      ...sequence,
      wellboreId: wellboreAssetIdReverseMap[sequence.assetId as number],
    }));
    const groupedSequenceSets = groupBy(sequenceSets, 'wellboreId');

    wellboreIds.forEach((wellboreId) => {
      const wellboreSequences = get(groupedSequenceSets, wellboreId, []);
      const sequenceData = wellboreSequences.map((sequence) => ({
        sequence,
      }));
      set(fetchedSequenceData, wellboreId, sequenceData);
    });

    return fetchedSequenceData;
  };
};
