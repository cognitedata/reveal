import { useNdsEventsQuery } from 'domain/wells/nds/internal/queries/useNdsEventsQuery';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import React, { useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';
import { DATE_NOT_AVAILABLE } from 'utils/date/constants';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { ExpandButton } from 'components/Buttons';
import { Loading } from 'components/Loading';
import { useTranslation } from 'hooks/useTranslation';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { ModuleFilterDropdownWrapper } from '../common/elements';

import {
  CustomMenu,
  LogsMessageWrapper,
  MarkersFilterWrapper,
} from './elements';
import { LogViewer } from './LogViewer';
import { DomainFilter } from './LogViewer/DomainFilter';
import { DomainListItem, DomainMap } from './LogViewer/DomainFilter/types';
import { WellLogView } from './types';

interface WellLogsPreviewProps {
  wellLogs: WellLogView[];
}

export const WellLogsPreview: React.FC<WellLogsPreviewProps> = ({
  wellLogs,
}) => {
  const [selectedWellLog, setSelectedWellLog] = useState<WellLogView>();
  const [domainList, setDomainList] = useState<DomainListItem[]>([]);
  const { t } = useTranslation();

  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data: ndsData, isLoading } = useNdsEventsQuery({ wellboreIds });

  const isNoData = isEmpty(wellLogs) || !selectedWellLog || !ndsData;

  const groupedNdsData = useMemo(
    () => groupByWellbore(ndsData || []),
    [ndsData]
  );

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

  const handleSelectWellLog = (wellLog: WellLogView) => {
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

    const { wellboreMatchingId } = selectedWellLog;

    return (
      <LogViewer
        wellLog={selectedWellLog}
        events={groupedNdsData[wellboreMatchingId]}
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
