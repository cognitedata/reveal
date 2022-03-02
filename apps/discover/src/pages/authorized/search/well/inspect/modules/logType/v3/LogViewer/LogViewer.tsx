import React from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/emptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { LogsMessageWrapper } from '../elements';
import { useEventsData } from '../hooks/useEventsData';
import { useWellLogsData } from '../hooks/useWellLogsData';

import { LogViewerProps } from './DomainFilter/types';
import { LogHolder } from './elements';
import { LogData as LogViewerData } from './Log/interfaces';
import Log from './Log/Log';

export const LogViewer: React.FC<LogViewerProps> = ({
  wellLog,
  wellLogRowData,
  events,
  domainMap,
  setDomainList,
}) => {
  const wellLogsData = useWellLogsData(wellLogRowData);
  const eventsData = useEventsData(events);

  const updateDomainList = (wellLogsData: LogViewerData) => {
    const domainData = Object.keys(wellLogsData).map((columnExternalId) => {
      const [min, max] = wellLogsData[columnExternalId].domain;
      return { columnExternalId, min, max };
    });
    setDomainList(domainData);
  };

  useDeepEffect(() => updateDomainList(wellLogsData), [wellLogsData]);

  const logViewerData = useDeepMemo(() => {
    return Object.keys(wellLogsData).reduce<LogViewerData>(
      (updatedWellLogsData, columnExternalId) => {
        const currentDomain = wellLogsData[columnExternalId].domain;
        const updatedDomain = domainMap[columnExternalId];

        return {
          ...updatedWellLogsData,
          [columnExternalId]: {
            ...wellLogsData[columnExternalId],
            domain: updatedDomain || currentDomain,
          },
        };
      },
      {}
    );
  }, [wellLogsData, domainMap]);

  if (isEmpty(wellLogRowData.columns)) {
    return (
      <LogsMessageWrapper>
        <EmptyState emptyTitle="Logs Not Found" />
      </LogsMessageWrapper>
    );
  }

  return (
    <LogHolder key={wellLog.id}>
      <Log
        logData={logViewerData}
        depthIndexColumnExternalId={wellLogRowData.depthColumn.columnExternalId}
        depthIndexType={wellLogRowData.depthColumn.type}
        eventsData={eventsData}
      />
    </LogHolder>
  );
};
