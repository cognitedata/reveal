import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import styled from 'styled-components/macro';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { DATE_NOT_AVAILABLE } from '_helpers/date';
import { ExpandButton } from 'components/buttons';
import { WhiteLoader } from 'components/loading';
import ManageColumnsPanel from 'components/manage-columns-panel';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { PETREL_LOG_TYPE, TRACK_CONFIG } from 'modules/wellSearch/constants';
import { useLogsPPFGQuery } from 'modules/wellSearch/hooks/useLogsPPFGQuery';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useWellboreData } from 'modules/wellSearch/selectors';
import { SequenceData } from 'modules/wellSearch/types';
import {
  getLogFrmsTopsIdMapping,
  getPetrelLogIdMapping,
} from 'modules/wellSearch/utils/logs';

import { ModuleFilterDropdownWrapper } from '../common/elements';

import { SequenceLogType } from './interfaces';
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
  logTypes: SequenceLogType[];
};

type LogTypeSelection = {
  id: number;
  logTypeId: number;
  logType?: string;
  webId: number;
  title: string;
};

export const LogTypeViewer: React.FC<Props> = ({ logTypes }) => {
  const [selectedLogType, setSelectedLogType] = useState<LogTypeSelection>();
  const [markersFilters, setMarkersFilters] = useState<MarkersFilter[]>([]);
  const [domains, setDomains] = useState<Domain[]>(
    TRACK_CONFIG.filter((track) => track.domain).map((track) => ({
      min: head(track?.domain) || 0,
      max: track?.domain && track.domain[1] ? track.domain[1] : 0,
      name: track.name,
    }))
  );
  const wellboreData = useWellboreData();
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const { data: ndsData, isLoading: ndsLoading } = useNdsEventsQuery();
  const { data: ppfgData, isLoading: ppfgLoading } = useLogsPPFGQuery(
    selectedLogType?.webId
  );

  const logTypeSelections: LogTypeSelection[] = useMemo(
    () =>
      logTypes.map((row, index) => ({
        id: index + 1,
        logTypeId: row.id as number,
        webId: row.assetId as number,
        title: row.name as string,
        logType: row.logType,
      })),
    [logTypes]
  );

  // Create log and id mapping object to access logs efficiently
  const logIdMapping = getPetrelLogIdMapping(logTypes, wellboreData);

  // Create log and id mapping object to access logs efficiently
  const logFrmsTopsIdMapping = getLogFrmsTopsIdMapping(logTypes, wellboreData);

  const getLogData = useCallback(
    (logs, logsFrmTops) =>
      dispatch(wellSearchActions.getLogData(logs, logsFrmTops)),
    []
  );

  const onLogTypeSelection = (item: LogTypeSelection) => {
    setSelectedLogType({ ...item });

    if (!item) {
      return;
    }

    if (!logIdMapping[item.logTypeId].rows) {
      const logsToFetch = logIdMapping[item.logTypeId].sequence;
      const wellboreId = logsToFetch.assetId as number;
      const logsFrmTopsToFetch = (
        wellboreData[wellboreId].logsFrmTops as SequenceData[]
      )
        .filter((logsFrmTop) => !logsFrmTop.rows)
        .map((logsFrmTops) => logsFrmTops.sequence);
      getLogData([logsToFetch], logsFrmTopsToFetch);
    }
  };

  if (!selectedLogType && !isEmpty(logTypeSelections)) {
    onLogTypeSelection(logTypeSelections[0]);
  }

  const selectedLogTypeHandle = (item: LogTypeSelection) => {
    onLogTypeSelection(item);
  };

  const getViewer = () => {
    if (!selectedLogType)
      return <LogsMessageWrapper>Logs Not Found</LogsMessageWrapper>;
    const { logTypeId, webId } = selectedLogType;

    if (ndsLoading || !ndsData || ppfgLoading) return <WhiteLoader />;
    if (!logIdMapping[logTypeId] || !logIdMapping[logTypeId].rows)
      return <WhiteLoader />;

    if (logFrmsTopsIdMapping[webId] && logFrmsTopsIdMapping[webId].rows) {
      const uniqMarkes = (
        sortBy(
          uniq(logFrmsTopsIdMapping[webId].rows?.map((row) => row[1]))
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
        logs={logIdMapping[logTypeId]}
        logFrmTops={logFrmsTopsIdMapping[webId]}
        ppfgs={ppfgData}
        selectedMarkers={selectedMarkers}
        events={ndsData[webId]}
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
              {logTypeSelections.map((item) => (
                <Menu.Item
                  key={item.id}
                  onClick={() => {
                    selectedLogTypeHandle(item);
                  }}
                >
                  {item.title}
                </Menu.Item>
              ))}
            </CustomMenu>
          }
        >
          <ExpandButton text={selectedLogType?.title || DATE_NOT_AVAILABLE} />
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
