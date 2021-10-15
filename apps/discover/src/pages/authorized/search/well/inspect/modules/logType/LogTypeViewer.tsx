import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import styled from 'styled-components/macro';

import { DATE_NOT_AVAILABLE } from '_helpers/date';
import { ExpandButton } from 'components/buttons';
import { Dropdown } from 'components/dropdown';
import { WhiteLoader } from 'components/loading';
import ManageColumnsPanel from 'components/manage-columns-panel';
import { wellSearchActions } from 'modules/wellSearch/actions';
import {
  GEOMECHANIC_LOG_TYPE,
  PETREL_LOG_TYPE,
  PPFG_LOG_TYPE,
  TRACK_CONFIG,
} from 'modules/wellSearch/constants';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useWellboreData } from 'modules/wellSearch/selectors';
import { SequenceData } from 'modules/wellSearch/types';
import {
  getGeomechanicIdMapping,
  getLogFrmsTopsIdMapping,
  getPetrelLogIdMapping,
  getPPFGIdMapping,
  getPPFGWellboreIdMapping,
} from 'modules/wellSearch/utils/logs';

import { ModuleFilterDropdownWrapper } from '../common/elements';

import { GeomechanicViewer } from './GeomechanicViewer';
import { SequenceLogType } from './interfaces';
import { LogViewer } from './LogViewer';
import { Domain, DomainMap, DomainConfig } from './LogViewer/DomainConfig';
import { LogsMessageWrapper } from './LogViewer/elements';
import { PPFGViewer } from './PPFGViewer';

export const MarkersFilterWrapper = styled.div`
  display: inline-block;
  margin-left: 10px;
  .CheckboxHolder {
    overflow-y: auto;
    max-height: 300px;
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

  // Create ppfg, wellbore id mapping object to access ppfgs efficiently
  const ppfgWellboreIdMapping = getPPFGWellboreIdMapping(
    logTypes,
    wellboreData
  );

  // Create ppfg and id mapping object to access ppfgs efficiently
  const ppfgIdMapping = getPPFGIdMapping(logTypes, wellboreData);

  // Create geomechanic and id mapping object to access geomechanics efficiently
  const geomechanicIdMapping = getGeomechanicIdMapping(logTypes, wellboreData);

  // Create log and id mapping object to access logs efficiently
  const logIdMapping = getPetrelLogIdMapping(logTypes, wellboreData);

  // Create log and id mapping object to access logs efficiently
  const logFrmsTopsIdMapping = getLogFrmsTopsIdMapping(logTypes, wellboreData);

  const getPPFGData = useCallback(
    (ppfg) => dispatch(wellSearchActions.getPPFGData(ppfg)),
    []
  );

  const getGeomechanicData = useCallback(
    (geomechanic) =>
      dispatch(wellSearchActions.getGeomechanicData(geomechanic)),
    []
  );

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

    if (item.logType === PPFG_LOG_TYPE && !ppfgIdMapping[item.logTypeId].rows) {
      getPPFGData(ppfgIdMapping[item.logTypeId].sequence);
    } else if (
      item.logType === GEOMECHANIC_LOG_TYPE &&
      !geomechanicIdMapping[item.logTypeId].rows
    ) {
      getGeomechanicData(geomechanicIdMapping[item.logTypeId].sequence);
    } else if (item.logType === PETREL_LOG_TYPE) {
      if (!logIdMapping[item.logTypeId].rows) {
        const logsToFetch = logIdMapping[item.logTypeId].sequence;
        const wellboreId = logsToFetch.assetId as number;
        const logsFrmTopsToFetch = (
          wellboreData[wellboreId].logsFrmTops as SequenceData[]
        )
          .filter((logsFrmTop) => !logsFrmTop.rows)
          .map((logsFrmTops) => logsFrmTops.sequence);
        const ppfgsToFetch = (wellboreData[wellboreId].ppfg as SequenceData[])
          .filter(
            (ppfg) =>
              !ppfg.rows &&
              ppfgWellboreIdMapping[wellboreId]?.sequence?.id ===
                ppfg.sequence.id
          )
          .map((ppfg) => ppfg.sequence);
        if (ppfgsToFetch.length > 0) {
          getPPFGData(ppfgsToFetch[0]);
        }
        getLogData([logsToFetch], logsFrmTopsToFetch);
      }
    }
  };

  if (!selectedLogType && !isEmpty(logTypeSelections)) {
    onLogTypeSelection(logTypeSelections[0]);
  }

  const selectedLogTypeHandle = (_e: any, item: LogTypeSelection) => {
    onLogTypeSelection(item);
  };

  const getViewer = () => {
    if (!selectedLogType)
      return <LogsMessageWrapper>Logs Not Found</LogsMessageWrapper>;
    const { logType, logTypeId, webId } = selectedLogType;

    if (logType === PPFG_LOG_TYPE) {
      return ppfgIdMapping[logTypeId] && ppfgIdMapping[logTypeId].rows ? (
        <PPFGViewer ppfgData={ppfgIdMapping[logTypeId]} />
      ) : (
        <WhiteLoader />
      );
    }

    if (logType === GEOMECHANIC_LOG_TYPE) {
      return geomechanicIdMapping[logTypeId] &&
        geomechanicIdMapping[logTypeId].rows ? (
        <GeomechanicViewer geomechanicData={geomechanicIdMapping[logTypeId]} />
      ) : (
        <WhiteLoader />
      );
    }

    if (logType === PETREL_LOG_TYPE) {
      if (ndsLoading || !ndsData) return <WhiteLoader />;
      if (ppfgWellboreIdMapping[webId] && !ppfgWellboreIdMapping[webId].rows)
        return <WhiteLoader />;
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
          ppfgs={ppfgWellboreIdMapping[webId]}
          selectedMarkers={selectedMarkers}
          events={ndsData[webId]}
          domains={domainMap}
        />
      );
    }

    return <></>;
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
  const handleSelectAllMarkers = (isAllSelected: boolean) => {
    setMarkersFilters(
      markersFilters.map((markersFilter) => ({
        ...markersFilter,
        selected: isAllSelected,
      }))
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
          handleChange={selectedLogTypeHandle}
          selected={{ ...selectedLogType }}
          items={logTypeSelections}
          displayField="title"
          valueField="id"
        >
          <ExpandButton text={selectedLogType?.title || DATE_NOT_AVAILABLE} />
        </Dropdown>
        {!isEmpty(markersFilters) && (
          <MarkersFilterWrapper>
            <ManageColumnsPanel
              columns={markersFilters}
              handleSelectAllColumns={handleSelectAllMarkers}
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
