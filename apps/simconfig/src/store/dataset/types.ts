import { DataSet } from '@cognite/sdk';
import { RequestStatus } from 'store/types';

export interface DatasetState {
  requestStatus: RequestStatus;
  initialized: boolean;
  datasets: (Omit<DataSet, 'createdTime' | 'lastUpdatedTime'> & {
    createdTime?: number;
    lastUpdatedTime?: number;
  })[];
}
