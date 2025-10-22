import { type Context, createContext } from 'react';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export type UseAll3dDirectConnectionsWithPropertiesDependencies = {
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUseAll3dDirectConnectionsWithPropertiesDependencies: UseAll3dDirectConnectionsWithPropertiesDependencies =
  {
    useFdmSdk
  };

export const UseAll3dDirectConnectionsWithPropertiesContext: Context<UseAll3dDirectConnectionsWithPropertiesDependencies> =
  createContext<UseAll3dDirectConnectionsWithPropertiesDependencies>(
    defaultUseAll3dDirectConnectionsWithPropertiesDependencies
  );
