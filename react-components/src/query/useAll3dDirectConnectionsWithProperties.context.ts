import { createContext } from 'react';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export type UseAll3dDirectConnectionsWithPropertiesDependencies = {
  useFdmSdk: typeof useFdmSdk;
};

export const defaultUseAll3dDirectConnectionsWithPropertiesDependencies: UseAll3dDirectConnectionsWithPropertiesDependencies =
  {
    useFdmSdk
  };

export const UseAll3dDirectConnectionsWithPropertiesContext =
  createContext<UseAll3dDirectConnectionsWithPropertiesDependencies>(
    defaultUseAll3dDirectConnectionsWithPropertiesDependencies
  );
