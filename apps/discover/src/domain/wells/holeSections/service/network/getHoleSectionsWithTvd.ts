import { addMdIndex } from 'domain/wells/trajectory/internal/transformers/addMdIndex';
import { getInterpolateTvd } from 'domain/wells/trajectory/service/network/getInterpolateTvd';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { HoleSectionGroupWithTvd } from '../../internal/types';
import { mergeHoleSectionsTvdData } from '../utils/mergeHoleSectionsTvdData';

import { getHoleSections } from './getHoleSections';
import { getInterpolateRequests } from './getInterpolateRequests';

export const getHoleSectionsWithTvd = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps): Promise<HoleSectionGroupWithTvd[]> => {
  const holeSectionsResponse = await getHoleSections({ wellboreIds, options });

  const interpolateRequests = getInterpolateRequests(holeSectionsResponse);
  const tvdResponse = await getInterpolateTvd(
    holeSectionsResponse,
    interpolateRequests
  )
    .then((tvd) => tvd.map(addMdIndex))
    .then(keyByWellbore);

  return holeSectionsResponse.map((holeSection) => {
    const { wellboreMatchingId, measuredDepthUnit } = holeSection;
    const trueVerticalDepths = tvdResponse[wellboreMatchingId];

    if (!trueVerticalDepths) {
      return {
        ...holeSection,
        trueVerticalDepthUnit: measuredDepthUnit,
      };
    }

    return mergeHoleSectionsTvdData(holeSection, trueVerticalDepths);
  });
};
