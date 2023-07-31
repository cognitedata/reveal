import { addMdIndex } from 'domain/wells/trajectory/internal/transformers/addMdIndex';
import { getInterpolateTvd } from 'domain/wells/trajectory/service/network/getInterpolateTvd';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { CasingSchematicWithTvd } from '../../internal/types';
import { getInterpolateRequests } from '../utils/getInterpolateRequests';
import { mergeCasingsTvdData } from '../utils/mergeCasingsTvdData';

import { getCasingSchematics } from './getCasingSchematics';

export const getCasingSchematicsWithTvd = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps): Promise<CasingSchematicWithTvd[]> => {
  const casingSchematicsResponse = await getCasingSchematics({
    wellboreIds,
    options,
  });

  const interpolateRequests = getInterpolateRequests(casingSchematicsResponse);
  const tvdResponse = await getInterpolateTvd(
    casingSchematicsResponse,
    interpolateRequests
  )
    .then((tvd) => tvd.map(addMdIndex))
    .then(keyByWellbore);

  return casingSchematicsResponse.map((casingSchematic) => {
    const { wellboreMatchingId } = casingSchematic;
    const trueVerticalDepths = tvdResponse[wellboreMatchingId];

    if (!trueVerticalDepths) {
      return casingSchematic;
    }

    return mergeCasingsTvdData(casingSchematic, trueVerticalDepths);
  });
};
