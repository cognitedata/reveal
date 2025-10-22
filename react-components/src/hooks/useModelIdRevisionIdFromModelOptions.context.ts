import { Context, createContext } from 'react';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';

export type ModelIdRevisionIdFromModelOptionsDependencies = {
  useFdmSdk: typeof useFdmSdk;
  getModelIdAndRevisionIdFromExternalId: typeof getModelIdAndRevisionIdFromExternalId;
};

export const defaultModelIdRevisionIdFromModelOptionsDependencies: ModelIdRevisionIdFromModelOptionsDependencies =
  {
    useFdmSdk,
    getModelIdAndRevisionIdFromExternalId
  };

export const ModelIdRevisionIdFromModelOptionsContext: Context<ModelIdRevisionIdFromModelOptionsDependencies> =
  createContext<ModelIdRevisionIdFromModelOptionsDependencies>(
    defaultModelIdRevisionIdFromModelOptionsDependencies
  );
