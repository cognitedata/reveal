import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';
import styled from 'styled-components/macro';
import { DATE_NOT_AVAILABLE } from 'utils/date';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { ExpandButton } from 'components/buttons';
import { Loading } from 'components/loading';
import ManageColumnsPanel from 'components/manage-columns-panel';
import { useDeepMemo } from 'hooks/useDeep';
import { PETREL_LOG_TYPE, TRACK_CONFIG } from 'modules/wellSearch/constants';
import { useLogsPPFGQuery } from 'modules/wellSearch/hooks/useLogsPPFGQuery';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';

import { ModuleFilterDropdownWrapper } from '../../common/elements';

import { useFetchWellFormationTopsRowData } from './hooks/useFetchWellFormationTopsRowData';
import { useFetchWellLogsRowData } from './hooks/useFetchWellLogsRowData';
import {
  useWellFormationTops,
  useWellFormationTopsWellboreIdMap,
} from './hooks/useWellFormationTopsQuerySelectors';
import { useWellboreLogSequenceIdMap } from './hooks/useWellLogsQuerySelectors';
import { LogTypeData } from './interfaces';
import { LogViewer } from './LogViewer';
import { Domain, DomainMap, DomainConfig } from './LogViewer/DomainConfig';
import { LogsMessageWrapper } from './LogViewer/elements';

export const MarkersFilterWrapper = styled.div`
  display: inline-block;
  margin-left: 10px;
  .CheckboxHolder {
    overflow-y: auto;
    max-height: 300px;
  }
`;

const CustomMenu = styled(Menu)`
  height: 80vh;
  overflow: auto;

  .cogs-menu-item {
    min-height: 36px;
  }
`;

type MarkersFilter = {
  selected: boolean;
  name: string;
  field: number;
};

type Props = {
  logTypes: LogTypeData[];
};

export const LogTypeViewer: React.FC<Props> = ({ logTypes }) => {
  const [selectedLogType, setSelectedLogType] = useState<LogTypeData>();
  const [markersFilters, setMarkersFilters] = useState<MarkersFilter[]>([]);
  const [domains, setDomains] = useState<Domain[]>(
    TRACK_CONFIG.filter((track) => track.domain).map((track) => ({
      min: head(track?.domain) || 0,
      max: track?.domain && track.domain[1] ? track.domain[1] : 0,
      name: track.name,
    }))
  );
  const { t } = useTranslation();

  const fetchWellLogsRowData = useFetchWellLogsRowData();
  const fetchWellFormationTopsRowData = useFetchWellFormationTopsRowData();

  const { data: ndsData, isLoading: ndsLoading } = useNdsEventsQuery();
  const { data: ppfgData, isLoading: ppfgLoading } = useLogsPPFGQuery(
    selectedLogType?.wellboreId
  );

  const selectedLogTypeWellboreIds = useDeepMemo(
    () => logTypes.map((logType) => logType.wellboreId),
    [logTypes]
  );
  const wellFormationTops = useWellFormationTops(selectedLogTypeWellboreIds);
  const logSequenceIdMap = useWellboreLogSequenceIdMap(
    selectedLogTypeWellboreIds
  );
  const wellFormationTopsWellboreIdMap = useWellFormationTopsWellboreIdMap(
    selectedLogTypeWellboreIds
  );

  const onLogTypeSelection = async (logType: LogTypeData) => {
    setSelectedLogType(logType);

    const wellwellFormationTopsSequences = get(
      wellFormationTops,
      logType.wellboreId,
      []
    ).map((logsFrmTop) => logsFrmTop.sequence);

    await fetchWellLogsRowData([logType]);
    await fetchWellFormationTopsRowData(wellwellFormationTopsSequences);
  };

  if (!selectedLogType && !isEmpty(logTypes)) {
    onLogTypeSelection(logTypes[0]);
  }

  const getViewer = () => {
    if (!selectedLogType)
      return <LogsMessageWrapper>Logs Not Found</LogsMessageWrapper>;
    const { id, wellboreId } = selectedLogType;

    if (ndsLoading || !ndsData || ppfgLoading) {
      return <Loading />;
    }

    if (!logSequenceIdMap[id] || !logSequenceIdMap[id].rows) {
      return <Loading />;
    }

    if (
      wellFormationTopsWellboreIdMap[wellboreId] &&
      wellFormationTopsWellboreIdMap[wellboreId].rows
    ) {
      const uniqMarkes = (
        sortBy(
          uniq(
            wellFormationTopsWellboreIdMap[wellboreId].rows?.map(
              (row) => row[1]
            )
          )
        ) as string[]
      ).filter(
        (marker) =>
          marker.includes('Mudline') ||
          marker.includes('Top') ||
          marker.includes('Base')
      );

      if (
        !isEqual(
          markersFilters.map((markersFilter) => markersFilter.name),
          uniqMarkes
        )
      ) {
        setMarkersFilters(
          uniqMarkes.map((uniqMarke, index) => ({
            name: uniqMarke,
            selected: false,
            field: index,
          }))
        );
      }
    } else if (markersFilters.length > 0) {
      setMarkersFilters([]);
    }

    const selectedMarkers = markersFilters
      .filter((markersFilter) => markersFilter.selected)
      .map((markersFilter) => markersFilter.name);

    const domainMap: DomainMap = {};

    domains.forEach((domain) => {
      domainMap[domain.name] = [domain.min, domain.max];
    });

    return (
      <LogViewer
        logs={logSequenceIdMap[id]}
        logFrmTops={wellFormationTopsWellboreIdMap[wellboreId]}
        ppfgs={ppfgData}
        selectedMarkers={selectedMarkers}
        events={ndsData[wellboreId]}
        domains={domainMap}
      />
    );
  };

  const handleMarkersSelection = (selectedColumn: {
    selected: boolean;
    name: string;
  }) => {
    setMarkersFilters(
      markersFilters.map((markersFilter) =>
        markersFilter.name === selectedColumn.name
          ? { ...markersFilter, selected: !selectedColumn.selected }
          : markersFilter
      )
    );
  };

  const handleDomainChange = (name: string, minMax: string, value: number) => {
    setDomains((domainList) =>
      domainList.map((domain) =>
        domain.name === name ? { ...domain, [minMax]: value } : domain
      )
    );
  };

  return (
    <>
      <ModuleFilterDropdownWrapper>
        <Dropdown
          content={
            <CustomMenu>
              {logTypes.map((logType) => (
                <Menu.Item
                  key={uniqueId()}
                  onClick={() => {
                    onLogTypeSelection(logType);
                  }}
                >
                  {logType.name}
                </Menu.Item>
              ))}
            </CustomMenu>
          }
        >
          <ExpandButton text={selectedLogType?.name || DATE_NOT_AVAILABLE} />
        </Dropdown>

        {!isEmpty(markersFilters) && (
          <MarkersFilterWrapper>
            <ManageColumnsPanel
              columns={markersFilters}
              handleColumnSelection={handleMarkersSelection}
            >
              <ExpandButton text={t('Filter Markers')} />
            </ManageColumnsPanel>
          </MarkersFilterWrapper>
        )}

        {selectedLogType && selectedLogType.logType === PETREL_LOG_TYPE && (
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

      {getViewer()}
    </>
  );
};
