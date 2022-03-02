import React, { useState, useMemo, useEffect } from 'react';

import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import { convertToPpg, unsafeChangeUnitTo } from 'utils/units';

import { Sequence, CogniteEvent } from '@cognite/sdk';

import { FEET, PPG } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { TRACK_CONFIG } from 'modules/wellSearch/constants';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { ndsAccessorsToFixedDecimal } from 'modules/wellSearch/selectors/event/constants';
import { getNdsUnitChangeAccessors } from 'modules/wellSearch/selectors/event/helper';
import { SequenceRow, SequenceData } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';
import { TrackConfig } from 'tenants/types';

import { DomainMap } from './DomainConfig/DomainConfig';
import { LogHolder, LogsMessageWrapper } from './elements';
import { LogData as LogViewerData, Tuplet } from './Log/interfaces';
import Log from './Log/Log';
import { getTrackUnit, sortTuples } from './utils';

type Props = {
  logs: SequenceData;
  logFrmTops: SequenceData;
  ppfgs?: SequenceData;
  events: CogniteEvent[];
  selectedMarkers: string[];
  domains: DomainMap;
};

const MD_COL_NAME = 'DEPT';
const FRM_TOPS_MD_COL_NAME = 'MD';
const PPFG_MD_COL_NAME = 'TVD';

export const LogViewer: React.FC<Props> = ({
  logs,
  logFrmTops,
  ppfgs,
  events,
  selectedMarkers,
  domains,
}) => {
  const { data: config } = useWellConfig();

  const [logsData, setLogsData] = useState<{ [key: number]: LogViewerData }>(
    {}
  );
  const [logsFrmTopsData, setLogsFrmTopsData] = useState<{
    [key: number]: LogViewerData;
  }>({});

  const [ppfgsData, setPPFGsData] = useState<{ [key: number]: LogViewerData }>(
    {}
  );

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const tracks = useMemo(() => {
    return get(config, 'logs.tracks', [])
      .filter((track: TrackConfig) => track.enabled)
      .map((track: TrackConfig) => track.name);
  }, [config]);

  // This set formatted log data in the state
  const setConvertedRowData = (log: Sequence, data: SequenceRow[]) => {
    const logData: LogViewerData = {};

    if (!isEmpty(data)) {
      const firstRow = head(data);

      // Create columns map with index
      const columnsIndexMap: { [key: string]: number } = {};
      firstRow?.columns.forEach((column, index) => {
        columnsIndexMap[column.name as string] = index;
      });

      // find MD column index
      const mdColIndex = columnsIndexMap[MD_COL_NAME];

      // Continues only if dataset has MD column
      if (mdColIndex === undefined) return;

      const mdUnit = log.columns[mdColIndex]?.metadata?.unit || FEET;

      // Get only the configured columns
      TRACK_CONFIG.forEach((track) => {
        if (track.type !== 'DepthLogs') return;

        const dataIndex = columnsIndexMap[track.column];
        const unit = log ? getTrackUnit(log, track.column) : '';
        if (track.name === 'MD' && userPreferredUnit) {
          // if the track name is 'MD', set the values as number list
          logData[track.name] = {
            values: data
              .map((row) => row[mdColIndex] as number)
              .map(
                (value) =>
                  unsafeChangeUnitTo(value, unit, userPreferredUnit) || 0
              ),
            unit: userPreferredUnit,
          };
        } else {
          // if the track name is not 'MD', set the values as Tuplet by setting the first value as MD value
          // if all the values are null, then track data will be deleted from the logData
          let valuesExist = false;
          const values = data.map((row) => {
            if (row[dataIndex] || row[dataIndex] === 0) {
              valuesExist = true;
            }
            return [
              unit !== '' && userPreferredUnit
                ? unsafeChangeUnitTo(
                    row[mdColIndex] as number,
                    mdUnit,
                    userPreferredUnit
                  )
                : row[mdColIndex],
              row[dataIndex],
            ] as Tuplet;
          });

          if (valuesExist) {
            logData[track.name] = {
              values,
              unit,
              domain: domains[track.name],
            };
          }
        }
      });
    }

    if (isEmpty(Object.keys(logData)) && userPreferredUnit) {
      const unit = getTrackUnit(log, MD_COL_NAME);
      const startDepth =
        unsafeChangeUnitTo(
          Number(get(log, 'metadata.startDepth')),
          unit,
          userPreferredUnit
        ) || 0;
      const endDepth =
        unsafeChangeUnitTo(
          Number(get(log, 'metadata.endDepth')),
          unit,
          userPreferredUnit
        ) || 0;

      logData.MD = {
        values: [startDepth, endDepth],
        unit,
      };
    }
    setLogsData((r) => ({ ...r, ...{ [log.id]: logData } }));
  };

  // This set formatted log formation tops data in the state
  const setConvertedFrmTopsRowData = (log: Sequence, data: SequenceRow[]) => {
    if (data.length === 0) return;

    const firstRow = head(data);

    // Create columns map with index
    const columnsIndexMap: { [key: string]: number } = {};
    firstRow?.columns.forEach((column, index) => {
      columnsIndexMap[column.name as string] = index;
    });

    // find MD column index
    const mdColIndex = columnsIndexMap[FRM_TOPS_MD_COL_NAME];

    const logFrmTopsData: LogViewerData = {};

    // Continues only if dataset has MD column
    if (mdColIndex !== undefined) {
      // Get only the configured columns
      TRACK_CONFIG.forEach((track) => {
        if (track.type !== 'FormationTops') return;

        const dataIndex = columnsIndexMap[track.column];
        const unit = log ? getTrackUnit(log, track.column) : '';
        // do nothing with MD column! We'll bake MD into the tuplet as usual and
        // then let videx map to the logsData MD instead
        if (track.name !== 'MD') {
          // if the track name is not 'MD', set the values as Tuplet by setting the first value as MD value
          // if all the values are null, then track data will be deleted from the logData
          let valuesExist = false;
          const values = data.map((row) => {
            if (row[dataIndex] !== null) {
              valuesExist = true;
            }
            return [row[mdColIndex], row[dataIndex]] as Tuplet;
          });

          if (valuesExist) {
            const sortedValues = sortTuples(values);

            const filteredValues = sortedValues.filter((tuplet) => {
              return (
                tuplet[1].toString().includes('Mudline') ||
                tuplet[1].toString().includes('Top') ||
                tuplet[1].toString().includes('Base')
              );
            });
            logFrmTopsData[track.name] = { values: filteredValues, unit };
          }
        }
      });
    }
    if (Object.keys(logFrmTopsData).length > 0) {
      setLogsFrmTopsData((r) => ({
        ...r,
        ...{ [log.assetId as number]: logFrmTopsData },
      }));
    }
  };

  // This set formatted ppfg data in the state
  const setConvertedPPFGRowData = (log: Sequence, data: SequenceRow[]) => {
    if (isEmpty(data)) return;

    const firstRow = head(data);

    // Create columns map with index
    const columnsIndexMap: { [key: string]: number } = {};
    firstRow?.columns.forEach((column, index) => {
      columnsIndexMap[column.name as string] = index;
    });

    // find MD column index
    const mdColIndex = columnsIndexMap[PPFG_MD_COL_NAME];

    // Continues only if dataset has MD column
    if (mdColIndex === undefined) return;

    const mdUnit = log.columns[mdColIndex].metadata?.unit || FEET;
    const topDepth =
      firstRow && userPreferredUnit
        ? unsafeChangeUnitTo(
            firstRow[mdColIndex] as number,
            mdUnit,
            userPreferredUnit
          ) || 0
        : null;
    const baseDepth = userPreferredUnit
      ? unsafeChangeUnitTo(
          data[data.length - 1][mdColIndex] as number,
          mdUnit,
          userPreferredUnit
        ) || 0
      : 0;

    const ppfgData: LogViewerData = {};
    // Get only the configured columns
    TRACK_CONFIG.forEach((track) => {
      if (track.type !== 'PPFG') return;

      const dataIndex = columnsIndexMap[track.column];
      const unit = log ? getTrackUnit(log, track.column) : '';
      const depthUnit = log ? getTrackUnit(log, PPFG_MD_COL_NAME) : '';

      // do nothing with MD column! We'll bake MD into the tuplet as usual and
      // then let videx map to the logsData MD instead
      if (track.name !== 'MD' && unit && depthUnit) {
        // if the track name is not 'MD', set the values as Tuplet by setting the first value as MD value
        // if all the values are null, then track data will be deleted from the logData
        let valuesExist = false;
        const values = data.map((row) => {
          let value = null;
          if (row[dataIndex] !== null) {
            valuesExist = true;
            value = convertToPpg(
              row[dataIndex] as number,
              unit,
              row[mdColIndex] as number,
              depthUnit
            );
          }
          return [
            unit !== '' && userPreferredUnit
              ? unsafeChangeUnitTo(
                  row[mdColIndex] as number,
                  'ft', // TODO(CM-6) problem
                  userPreferredUnit
                )
              : row[mdColIndex],
            value,
          ] as Tuplet;
        });
        if (valuesExist) {
          ppfgData[track.name] = {
            values,
            unit: PPG,
            domain: domains[track.name],
          };
        }
      }
    });
    if (!isEmpty(Object.keys(ppfgData))) {
      setPPFGsData((r) => ({ ...r, ...{ [log.assetId as number]: ppfgData } }));

      // This is added to extend logs data ranges based on the ppfg top and base depth.
      if (topDepth !== null && baseDepth) {
        setLogsData((stateLogsData) => {
          const logData = { ...stateLogsData[logs.sequence.id] };
          if (logData.MD && logData.MD.values.length) {
            const logValues = [...logData.MD.values] as number[];
            const firstLogValue = head(logValues);
            if (firstLogValue && firstLogValue > topDepth) {
              logValues.unshift(topDepth);
            }
            if (logValues[logValues.length - 1] < baseDepth) {
              logValues.push(baseDepth);
            }
            return {
              ...stateLogsData,
              [logs.sequence.id]: {
                ...logData,
                MD: { ...logData.MD, values: logValues },
              },
            };
          }
          return stateLogsData;
        });
      }
    }
  };

  if (!logsData[logs.sequence.id]) {
    setConvertedRowData(logs.sequence, logs.rows as SequenceRow[]);
    if (logFrmTops) {
      setConvertedFrmTopsRowData(
        logFrmTops.sequence,
        logFrmTops.rows as SequenceRow[]
      );
    }
    if (ppfgs) {
      setConvertedPPFGRowData(ppfgs.sequence, ppfgs.rows as SequenceRow[]);
    }
  }

  const formattedEvents = useMemo(() => {
    const overlappingEvents: { [key: number]: boolean } = {};

    events.forEach((event) => {
      events.forEach((childEvent) => {
        if (
          childEvent.id !== event.id &&
          get(event, 'metadata.name') === get(childEvent, 'metadata.name') &&
          Number(get(event, 'metadata.md_hole_start')) >=
            Number(get(childEvent, 'metadata.md_hole_start')) &&
          Number(get(event, 'metadata.md_hole_end')) <=
            Number(get(childEvent, 'metadata.md_hole_end'))
        ) {
          overlappingEvents[event.id] = true;
        }
      });
    });

    return sortBy(events, (event) =>
      Number(get(event, 'metadata.md_hole_start'))
    )
      .filter((event) => !overlappingEvents[event.id])
      .map((event) =>
        convertObject(event)
          .changeUnits(getNdsUnitChangeAccessors(userPreferredUnit))
          .toClosestInteger(ndsAccessorsToFixedDecimal)
          .get()
      )
      .flatMap((event) => [
        [
          Number(get(event, 'metadata.md_hole_start')),
          get(event, 'metadata.name'),
        ],
        [Number(get(event, 'metadata.md_hole_end')), null],
      ]);
  }, [events, userPreferredUnit]);

  // This function is used to update domain values in logs data
  const updateDomainsInLogs = (stateLogsData: {
    [key: number]: LogViewerData;
  }) => {
    const tempLogsData: { [key: number]: LogViewerData } = {};
    Object.keys(stateLogsData).forEach((key: string) => {
      const tempLogData = { ...stateLogsData[Number(key)] };
      Object.keys(tempLogData).forEach((logName) => {
        if (domains[logName]) {
          tempLogData[logName].domain = domains[logName];
        }
      });
      tempLogsData[Number(key)] = tempLogData;
    });
    return tempLogsData;
  };

  useEffect(() => {
    setLogsData(updateDomainsInLogs);
    setPPFGsData(updateDomainsInLogs);
  }, [domains]);

  if (!tracks.length) {
    return (
      <LogsMessageWrapper>Track Configurations Not Found</LogsMessageWrapper>
    );
  }

  if (!logsData || !logsData[logs.sequence.id]) {
    return <LogsMessageWrapper>Logs Not Found</LogsMessageWrapper>;
  }

  return (
    <>
      {Object.keys(logsData).map((id) => {
        return logs.sequence.id !== Number(id) ? null : (
          <LogHolder key={id}>
            <Log
              displayTracks={tracks}
              logData={{
                ...logsData[logs.sequence.id],
                ...ppfgsData[Number(logs.sequence.assetId)],
              }}
              logFrmTopsData={get(
                logsFrmTopsData,
                Number(logs.sequence.assetId),
                {}
              )}
              selectedMarkers={selectedMarkers}
              eventData={formattedEvents}
            />
          </LogHolder>
        );
      })}
    </>
  );
};
