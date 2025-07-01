import { type FdmSDK } from '../../data-providers/FdmSDK';
import { createContext } from 'react';

/**
 * Includes both the low-level SDK and a higher-level fdm3dDataprovider.
 * The latter is adviced used (and extended) for all 3D-related queries, while the
 * FdmSDK can be used for all other queries
 */
export type FdmDataProviderContextContent = {
  fdmSdk: FdmSDK;
};

export const FdmSdkContext = createContext<FdmDataProviderContextContent | null>(null);
