import { createContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { FdmSDK } from '../../data-providers/FdmSDK';
import { SCENE_RELATED_DATA_LIMIT } from './types';
import { getRevisionExternalIdAndSpace } from '../network/getRevisionExternalIdAndSpace';

export type Use3dScenesDependencies = {
  useSDK: (userSdk?: CogniteClient) => CogniteClient;
  createFdmSdk: (sdk: CogniteClient) => FdmSDK;
  sceneRelatedDataLimit?: number;
  getRevisionExternalIdAndSpace: typeof getRevisionExternalIdAndSpace;
};

export const defaultUse3dScenesDependencies: Use3dScenesDependencies = {
  useSDK,
  createFdmSdk: (sdk: CogniteClient) => new FdmSDK(sdk),
  sceneRelatedDataLimit: SCENE_RELATED_DATA_LIMIT,
  getRevisionExternalIdAndSpace
};

export const Use3dScenesContext = createContext<Use3dScenesDependencies>(
  defaultUse3dScenesDependencies
);
