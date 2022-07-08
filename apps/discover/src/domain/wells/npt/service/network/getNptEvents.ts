import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Npt } from '@cognite/sdk-wells';

import { EVENT_PER_PAGE } from '../constants';

export const getNptEvents = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<Npt>({
    signal: options?.signal,
    action: getWellSDKClient().npt.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: EVENT_PER_PAGE,
    },
  });
};
