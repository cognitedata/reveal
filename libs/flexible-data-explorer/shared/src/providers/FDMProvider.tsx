import { createContext, useContext, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { FDMClientV2 } from '../clients/FDMClientV2';
import { FDMComposer } from '../clients/FDMComposer';
import { FDMSchema } from '../clients/FDMSchema';
import { DataModelByIdResponse } from '../types/services';

const FDMContext = createContext<FDMComposer | undefined>(undefined);

interface Props {
  data?: DataModelByIdResponse[];
}
export const FDMProvider: FC<PropsWithChildren<Props>> = ({
  children,
  data,
}) => {
  const sdk = useSDK();

  const fdmComposer = useMemo(() => {
    const fdmClients = data?.map((dataModel) => {
      const schema = new FDMSchema(dataModel);
      return new FDMClientV2(sdk, schema);
    });

    return new FDMComposer(fdmClients);
  }, [sdk, data]);

  return (
    <FDMContext.Provider value={fdmComposer}>{children}</FDMContext.Provider>
  );
};

export const useFDM = () => {
  const context = useContext(FDMContext);
  if (!context) {
    throw new Error('useFDM must be used within an instance of FDMProvider');
  }
  return context;
};
