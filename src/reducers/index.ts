import { createCogniteResourceStore } from '@cognite/cdf-resources-store';
import app from 'modules/app';
import fileContextualization from 'modules/fileContextualization';
import annotations from 'modules/annotations';
import { getSDK } from 'utils/SDK';

const createRootReducer = () =>
  createCogniteResourceStore(getSDK(), {
    annotations,
    app,
    fileContextualization,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
