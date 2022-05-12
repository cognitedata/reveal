import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';
import { DATE_NOT_AVAILABLE } from 'utils/date/constants';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { ExpandButton } from 'components/Buttons';
import { Loading } from 'components/Loading';
import { useWellLogsRowDataKeyBySource } from 'modules/wellInspect/hooks/useWellLogsRowDataSelectors';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';

import { ModuleFilterDropdownWrapper } from '../common/elements';

import {
  CustomMenu,
  LogsMessageWrapper,
  MarkersFilterWrapper,
} from './elements';
import { LogViewer } from './LogViewer';
import { DomainFilter } from './LogViewer/DomainFilter';
import { DomainListItem, DomainMap } from './LogViewer/DomainFilter/types';
import { WellLog } from './types';

export const WellLogsPreview: React.FC<{ wellLogs: WellLog[] }> = ({
  wellLogs,
}) => {
  const [selectedWellLog, setSelectedWellLog] = useState<WellLog>();
  const [domainList, setDomainList] = useState<DomainListItem[]>([]);
  const { t } = useTranslation();

  const { data: wellLogsRowData, isLoading: isWellLogsRowDataLoading } =
    useWellLogsRowDataKeyBySource(
      selectedWellLog ? [selectedWellLog.source.sequenceExternalId] : []
    );

  const { data: ndsEventsData, isLoading: isNdsEventsDataLoading } =
    useNdsEventsQuery();

  const isNoData = !selectedWellLog || !wellLogsRowData || !ndsEventsData;
  const isLoading = isWellLogsRowDataLoading || isNdsEventsDataLoading;

  if (!selectedWellLog && !isEmpty(wellLogs)) {
    setSelectedWellLog(wellLogs[0]);
  }

  const handleDomainChange = (
    columnExternalId: string,
    domainType: string,
    value: number
  ) => {
    setDomainList((domainList) =>
      domainList.map((domain) =>
        domain.columnExternalId === columnExternalId
          ? { ...domain, [domainType]: value }
          : domain
      )
    );
  };

  const domainMap = domainList.reduce<DomainMap>((map, domainListItem) => {
    const { columnExternalId, min, max } = domainListItem;
    return {
      ...map,
      [columnExternalId]: [min, max],
    };
  }, {});

  const handleSelectWellLog = (wellLog: WellLog) => {
    // Reset domains to avoid the current domains config being jammed with the newly selected log.
    setDomainList([]);
    setSelectedWellLog(wellLog);
  };

  const renderLogViewer = () => {
    if (isNoData || isLoading) {
      return (
        <LogsMessageWrapper>
          <Loading />
        </LogsMessageWrapper>
      );
    }

    const { wellboreMatchingId, source } = selectedWellLog;

    return (
      <LogViewer
        wellLog={selectedWellLog}
        wellLogRowData={wellLogsRowData[source.sequenceExternalId]}
        events={ndsEventsData[wellboreMatchingId]}
        domainMap={domainMap}
        setDomainList={setDomainList}
      />
    );
  };

  return (
    <>
      <ModuleFilterDropdownWrapper>
        <Dropdown
          content={
            <CustomMenu>
              {wellLogs.map((wellLog) => (
                <Menu.Item
                  key={uniqueId()}
                  onClick={() => handleSelectWellLog(wellLog)}
                >
                  {wellLog.source.sequenceExternalId}
                </Menu.Item>
              ))}
            </CustomMenu>
          }
        >
          <ExpandButton
            text={
              selectedWellLog?.source.sequenceExternalId || DATE_NOT_AVAILABLE
            }
            data-testid="sequence-select-expand-button"
          />
        </Dropdown>

        {!isNoData && !isLoading && (
          <MarkersFilterWrapper>
            <DomainFilter
              domainList={domainList}
              onChangeDomain={handleDomainChange}
            >
              <ExpandButton
                text={t('Value Range')}
                data-testid="domain-filter-expand-button"
              />
            </DomainFilter>
          </MarkersFilterWrapper>
        )}
      </ModuleFilterDropdownWrapper>

      {renderLogViewer()}
    </>
  );
};
