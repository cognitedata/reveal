import { createContext, useContext, useEffect, useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';

import { sendToCopilotEvent } from '@fusion/copilot-core';

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

  useEffect(() => {
    if (dataModel && space && version) {
      // TODO: fix code to send correct event name and data to copilot
      sendToCopilotEvent('NEW_MESSAGES', [
        {
          type: 'data-model',
          space,
          version,
          dataModel,
          content: 'I want to search on this data model',
          source: 'bot',
        },
      ]);
      // sendToCopilotEvent('GET_CODE', selectedDataModel?.dataModel);
    }
  }, [dataModel, space, version]);

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
