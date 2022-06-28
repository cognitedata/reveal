import { NdsInternal } from 'domain/wells/nds/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import EmptyState from 'components/EmptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { LogsMessageWrapper } from '../elements';
import { useEventsData } from '../hooks/useEventsData';
import { useWellLogsData } from '../hooks/useWellLogsData';
import { WellLog } from '../types';

import { DomainListItem, DomainMap } from './DomainFilter/types';
import { LogHolder } from './elements';
import { LogData as LogViewerData } from './Log/interfaces';
import Log from './Log/Log';

interface LogViewerProps {
  wellLog: WellLog;
  wellLogRowData: DepthMeasurementData | undefined;
  events?: NdsInternal[];
  domainMap: DomainMap;
  setDomainList: (domainList: DomainListItem[]) => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  wellLog,
  wellLogRowData,
  events = [],
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

  if (!wellLogRowData || isEmpty(wellLogRowData?.columns)) {
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
