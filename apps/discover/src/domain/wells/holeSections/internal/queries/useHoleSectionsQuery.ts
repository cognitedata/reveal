import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors/handleServiceError';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_HOLE_SECTIONS } from '../../constants';
import { getHoleSections } from '../../service/network/getHoleSections';
import { normalizeHoleSectionGroups } from '../transformers/normalizeHoleSectionGroups';
import { HoleSectionGroupInternal } from '../types';

export const useHoleSectionsQuery = ({ wellboreIds }: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<HoleSectionGroupInternal>({
    key: [...WELL_QUERY_KEY.HOLE_SECTIONS, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getHoleSections({ wellboreIds, options })
        .then((holeSectionGroups) => {
          return normalizeHoleSectionGroups(
            holeSectionGroups,
            userPreferredUnit
          );
        })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_HOLE_SECTIONS)
        ),
  });
};
