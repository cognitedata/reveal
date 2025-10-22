import { type Context, createContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { FdmSDK } from '../../data-providers/FdmSDK';
import { SCENE_RELATED_DATA_LIMIT } from './types';

export type Use3dScenesDependencies = {
  useSDK: (userSdk?: CogniteClient) => CogniteClient;
  createFdmSdk: (sdk: CogniteClient) => FdmSDK;
  sceneRelatedDataLimit?: number;
};

export const defaultUse3dScenesDependencies: Use3dScenesDependencies = {
  useSDK,
  createFdmSdk: (sdk: CogniteClient) => new FdmSDK(sdk),
  sceneRelatedDataLimit: SCENE_RELATED_DATA_LIMIT
};

export const Use3dScenesContext: Context<Use3dScenesDependencies> =
  createContext<Use3dScenesDependencies>(defaultUse3dScenesDependencies);
