import { createCogniteResourceStore } from '@cognite/cdf-resources-store';
import fileContextualization from 'modules/fileContextualization';
import { getSDK } from 'utils/SDK';

const createRootReducer = () =>
  createCogniteResourceStore(getSDK(), {
    fileContextualization,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
