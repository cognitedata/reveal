import { FetchOptions } from 'utils/fetchAllCursors';

import { Wellbore } from '@cognite/sdk-wells-v3';

export interface GetAllInspectDataProps {
  wellboreIds: Set<Wellbore['matchingId']>;
  options?: FetchOptions;
}

export interface AllCursorsProps {
  wellboreIds: Set<Wellbore['matchingId']>;
}
