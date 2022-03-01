import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';
import { DATE_NOT_AVAILABLE } from 'utils/date/constants';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { ExpandButton } from 'components/buttons';
import { Loading } from 'components/loading';
import { useWellLogsRowDataKeyBySource } from 'modules/wellInspect/hooks/useWellLogsRowDataSelectors';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';

import { ModuleFilterDropdownWrapper } from '../../common/elements';

import {
  CustomMenu,
  LogsMessageWrapper,
  MarkersFilterWrapper,
} from './elements';
import { LogViewer } from './LogViewer';
import { Domain, DomainConfig, DomainMap } from './LogViewer/DomainConfig';
import { WellLog } from './types';

export const LogTypeViewer: React.FC<{ wellLogs: WellLog[] }> = ({
  wellLogs,
}) => {
  const [selectedWellLog, setSelectedWellLog] = useState<WellLog>();
  const [domains, setDomains] = useState<Domain[]>([]);
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
    minMax: string,
    value: number
  ) => {
    setDomains((domainList) =>
      domainList.map((domain) =>
        domain.columnExternalId === columnExternalId
          ? { ...domain, [minMax]: value }
          : domain
      )
    );
  };

  const domainMap = domains.reduce<DomainMap>(
    (map, domain) => ({
      ...map,
      [domain.columnExternalId]: [domain.min, domain.max],
    }),
    {}
  );

  const handleSelectWellLog = (wellLog: WellLog) => {
    // Reset domains to avoid the current domains config being jammed with the newly selected log.
    setDomains([]);
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
        setDomains={setDomains}
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
          />
        </Dropdown>

        {!isNoData && !isLoading && (
          <MarkersFilterWrapper>
            <DomainConfig
              domainList={domains}
              handleChange={handleDomainChange}
            >
              <ExpandButton text={t('Value Range')} />
            </DomainConfig>
          </MarkersFilterWrapper>
        )}
      </ModuleFilterDropdownWrapper>

      {renderLogViewer()}
    </>
  );
};
