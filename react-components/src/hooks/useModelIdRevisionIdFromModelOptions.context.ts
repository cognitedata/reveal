import { createContext } from 'react';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { useQueriedAddModelOptions } from './useQueriedAddModelOptions';

export type ModelIdRevisionIdFromModelOptionsDependencies = {
  useQueriedAddModelOptions: typeof useQueriedAddModelOptions;
  useFdmSdk: typeof useFdmSdk;
};

export const ModelIdRevisionIdFromModelOptionsContext =
  createContext<ModelIdRevisionIdFromModelOptionsDependencies>({
    useQueriedAddModelOptions,
    useFdmSdk
  });
