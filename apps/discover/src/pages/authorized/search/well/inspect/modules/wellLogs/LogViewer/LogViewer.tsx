import { NdsInternal } from 'domain/wells/nds/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { LogsMessageWrapper } from '../elements';
import { WellLogView } from '../types';
import { adaptToWellLogNdsEventsData } from '../utils/adaptToWellLogNdsEventsData';
import { adaptToWellLogPreviewData } from '../utils/adaptToWellLogPreviewData';

import { DomainListItem, DomainMap } from './DomainFilter/types';
import { LogHolder } from './elements';
import Log from './Log/Log';
import { WellLogPreviewData } from './Log/types';

interface LogViewerProps {
  wellLog: WellLogView;
  events?: NdsInternal[];
  domainMap: DomainMap;
  setDomainList: (domainList: DomainListItem[]) => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  wellLog,
  events = [],
  domainMap,
  setDomainList,
}) => {
  const previewData = useDeepMemo(
    () => adaptToWellLogPreviewData(wellLog),
    [wellLog]
  );

  const eventsData = useDeepMemo(
    () => adaptToWellLogNdsEventsData(events),
    [events]
  );

  const updateDomainList = (wellLogsData: WellLogPreviewData) => {
    const domainData = Object.keys(wellLogsData).map((columnExternalId) => {
      const [min, max] = wellLogsData[columnExternalId].domain;
      return { columnExternalId, min, max };
    });
    setDomainList(domainData);
  };

  useDeepEffect(() => updateDomainList(previewData), [previewData]);

  const logViewerData = useDeepMemo(() => {
    return Object.keys(previewData).reduce<WellLogPreviewData>(
      (updatedWellLogsData, columnExternalId) => {
        const currentDomain = previewData[columnExternalId].domain;
        const updatedDomain = domainMap[columnExternalId];

        return {
          ...updatedWellLogsData,
          [columnExternalId]: {
            ...previewData[columnExternalId],
            domain: updatedDomain || currentDomain,
          },
        };
      },
      {}
    );
  }, [previewData, domainMap]);

  if (isEmpty(previewData)) {
    return (
      <LogsMessageWrapper>
        <EmptyState emptyTitle="Logs Not Found" />
      </LogsMessageWrapper>
    );
  }

  const { externalId, type } = wellLog.depthColumn;

  return (
    <LogHolder key={wellLog.id}>
      <Log
        logData={logViewerData}
        depthIndexColumnExternalId={externalId}
        depthIndexType={type}
        eventsData={eventsData}
      />
    </LogHolder>
  );
};
