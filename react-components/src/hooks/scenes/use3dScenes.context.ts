import { createContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { FdmSDK } from '../../data-providers/FdmSDK';

export type Use3dScenesDependencies = {
  useSDK: (userSdk?: CogniteClient) => CogniteClient;
  createFdmSdk: (sdk: CogniteClient) => FdmSDK;
};

export const defaultUse3dScenesDependencies: Use3dScenesDependencies = {
  useSDK,
  createFdmSdk: (sdk: CogniteClient) => new FdmSDK(sdk)
};

export const Use3dScenesContext = createContext<Use3dScenesDependencies>(
  defaultUse3dScenesDependencies
);
