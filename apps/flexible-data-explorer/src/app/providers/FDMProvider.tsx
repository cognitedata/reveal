import { createContext, useContext, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { Loader } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { DataModelSelector } from '../containers/selectors/DataModelSelector';
import { useTypesDataModelsQuery } from '../services/dataModels/query/useTypesDataModelQuery';
import { FDMClientV2 } from '../services/FDMClientV2';
import { FDMComposer } from '../services/FDMComposer';
import { FDMSchema } from '../services/FDMSchema';
import { useSelectedDataModels } from '../services/useSelectedDataModels';

const FDMContext = createContext<FDMComposer | undefined>(undefined);

export const FDMProvider: FC<PropsWithChildren> = ({ children }) => {
  const sdk = useSDK();

  const dataModels = useSelectedDataModels();

  const { data, isLoading } = useTypesDataModelsQuery();

  const fdmComposer = useMemo(() => {
    const fdmClients = data?.map((dataModel) => {
      const schema = new FDMSchema(dataModel);
      return new FDMClientV2(sdk, schema);
    });

    return new FDMComposer(fdmClients);
  }, [sdk, data]);

  // useEffect(() => {
  //   if (dataModel && space && version) {
  //     // TODO: fix code to send correct event name and data to copilot
  //     sendToCopilotEvent('NEW_MESSAGES', [
  //       {
  //         type: 'data-model',
  //         space,
  //         version,
  //         dataModel,
  //         content: 'I want to search on this data model',
  //         source: 'bot',
  //       },
  //     ]);
  //     // sendToCopilotEvent('GET_CODE', selectedDataModel?.dataModel);
  //   }
  // }, [dataModel, space, version]);

  if (!dataModels) {
    return <DataModelSelector />;
  }

  if (isLoading) {
    return <Loader />;
  }

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
