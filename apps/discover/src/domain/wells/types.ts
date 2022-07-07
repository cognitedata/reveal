import { FetchOptions } from 'utils/fetchAllCursors';

import { SequenceSource, Wellbore } from '@cognite/sdk-wells-v3';

import { DataError } from 'modules/inspectTabs/types';

export interface GetAllInspectDataProps {
  wellboreIds: Set<Wellbore['matchingId']>;
  options?: FetchOptions;
}

export interface AllCursorsProps {
  wellboreIds: Array<Wellbore['matchingId']>;
}

export interface SequenceDataError {
  source: SequenceSource;
  errors: DataError[];
}
