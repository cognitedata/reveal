import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { handleServiceError } from 'utils/errors/handleServiceError';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_HOLE_SECTIONS } from '../../constants';
import { getHoleSectionsWithTvd } from '../../service/network/getHoleSectionsWithTvd';
import { normalizeHoleSectionGroupWithTvd } from '../transformers/normalizeHoleSectionGroupWithTvd';
import { HoleSectionGroupInternalWithTvd } from '../types';

export const useHoleSectionsWithTvdQuery = ({
  wellboreIds,
}: AllCursorsProps) => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useArrayCache<HoleSectionGroupInternalWithTvd>({
    key: [...WELL_QUERY_KEY.HOLE_SECTIONS_WITH_TVD, userPreferredUnit],
    items: new Set(wellboreIds),
    fetchAction: (wellboreIds, options) =>
      getHoleSectionsWithTvd({ wellboreIds, options })
        .then((holeSectionGroups) => {
          return holeSectionGroups.map((holeSectionGroup) =>
            normalizeHoleSectionGroupWithTvd(
              holeSectionGroup,
              userPreferredUnit
            )
          );
        })
        .then(groupByWellbore)
        .catch((error) =>
          handleServiceError(error, {}, ERROR_LOADING_HOLE_SECTIONS)
        ),
  });
};
