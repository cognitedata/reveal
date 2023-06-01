import { createContext, useContext, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';

import { useSDK } from '@cognite/sdk-provider';

import { FDMClient } from '../services/FDMClient';

const FDMContext = createContext<FDMClient | undefined>(undefined);

export const FDMProvider: FC<PropsWithChildren> = ({ children }) => {
  const sdk = useSDK();
  const { dataModel, space, version } = useParams();

  const fdmClient = useMemo(() => {
    if (!(dataModel && space && version)) {
      throw new Error('Missing dataModel, space or version');
    }

    return new FDMClient(sdk, { dataModel, space, version });
  }, [sdk, dataModel, space, version]);

  return (
    <FDMContext.Provider value={fdmClient}>{children}</FDMContext.Provider>
  );
};

export const useFDM = () => {
  const context = useContext(FDMContext);
  if (!context) {
    throw new Error('useFDM must be used within an instance of FDMProvider');
  }
  return context;
};
