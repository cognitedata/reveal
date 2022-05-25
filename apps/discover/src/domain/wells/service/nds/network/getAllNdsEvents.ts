import { GetAllInspectDataProps } from 'domain/wells/types';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { getWellSDKClient } from 'services/wellSearch/sdk';
import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Nds } from '@cognite/sdk-wells-v3';

import { EVENT_PER_PAGE } from '../constants';

export const getAllNdsEvents = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<Nds>({
    signal: options?.signal,
    action: getWellSDKClient().nds.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: EVENT_PER_PAGE,
    },
  });
};
