/*!
 * Copyright 2024 Cognite AS
 */
import { type FdmSDK } from '../../data-providers/FdmSDK';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';
import { createContext } from 'react';

/**
 * Includes both the low-level SDK and a higher-level fdm3dDataprovider.
 * The latter is adviced used (and extended) for all 3D-related queries, while the
 * FdmSDK can be used for all other queries
 */
export type FdmDataProviderContextContent = {
  fdmSdk: FdmSDK;
  fdm3dDataProvider: Fdm3dDataProvider;
};

export const FdmSdkContext = createContext<FdmDataProviderContextContent | null>(null);
