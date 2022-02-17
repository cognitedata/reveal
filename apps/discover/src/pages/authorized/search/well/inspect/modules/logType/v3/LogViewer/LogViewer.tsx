import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { CogniteEvent } from '@cognite/sdk';
import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import EmptyState from 'components/emptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { LogsMessageWrapper } from '../elements';
import { useEventsData } from '../hooks/useEventsData';
import { useTracks } from '../hooks/useTracks';
import { useWellLogsData } from '../hooks/useWellLogsData';
import { WellLog } from '../types';

import {
  Domain,
  // Domain,
  DomainMap,
} from './DomainConfig/DomainConfig';
import { LogHolder } from './elements';
import { LogData as LogViewerData } from './Log/interfaces';
import Log from './Log/Log';

type Props = {
  wellLog: WellLog;
  wellLogRowData: DepthMeasurementData;
  events: CogniteEvent[];
  domainMap: DomainMap;
  setDomains: (domains: Domain[]) => void;
};

export const LogViewer: React.FC<Props> = ({
  wellLog,
  wellLogRowData,
  events,
  domainMap,
  setDomains,
}) => {
  const tracks = useTracks();
  const wellLogsData = useWellLogsData(wellLogRowData);
  const eventsData = useEventsData(events);

  const setDomainData = (wellLogsData: LogViewerData) => {
    const domainData = Object.keys(wellLogsData).map((columnExternalId) => {
      const [min, max] = wellLogsData[columnExternalId].domain;
      return { columnExternalId, min, max };
    });
    setDomains(domainData);
  };

  useDeepEffect(() => setDomainData(wellLogsData), [wellLogsData]);

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

  if (!tracks.length) {
    return (
      <LogsMessageWrapper>
        <EmptyState emptyTitle="Track Configurations Not Found" />
      </LogsMessageWrapper>
    );
  }

  if (isEmpty(logViewerData)) {
    return (
      <LogsMessageWrapper>
        <EmptyState emptyTitle="Logs Not Found" />
      </LogsMessageWrapper>
    );
  }

  return (
    <LogHolder key={wellLog.id}>
      <Log
        displayTracks={tracks}
        logData={logViewerData}
        depthIndexColumnExternalId={wellLogRowData.depthColumn.columnExternalId}
        depthIndexType={wellLogRowData.depthColumn.type}
        eventsData={eventsData}
      />
    </LogHolder>
  );
};
