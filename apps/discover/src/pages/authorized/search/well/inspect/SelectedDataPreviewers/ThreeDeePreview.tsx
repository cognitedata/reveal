import React, { useMemo, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import flatten from 'lodash/flatten';
import get from 'lodash/get';
import isArray from 'lodash/isArray';

import { Sequence, CogniteEvent } from '@cognite/sdk';

import { ThreeDee } from 'components/3d';
import EmptyState from 'components/emptyState';
import { LOADING_SUB_TEXT } from 'components/emptyState/constants';
import { StoreState } from 'core/types';
import { useFetchWellFormationTopsRowData } from 'modules/wellInspect/hooks/useFetchWellFormationTopsRowData';
import { useFetchWellLogsRowData } from 'modules/wellInspect/hooks/useFetchWellLogsRowData';
import { useWellFormationTopsQuery } from 'modules/wellInspect/hooks/useWellFormationTopsQuery';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellLogsQuery } from 'modules/wellInspect/hooks/useWellLogsQuery';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useSelectedWellboresCasingsQuery } from 'modules/wellSearch/hooks/useSelectedWellboresCasingsQuery';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { useNptEventsFor3D } from 'modules/wellSearch/selectors';
import { orderedCasingsByBase } from 'modules/wellSearch/utils/casings';

const ThreeDeeEmptyStateLoader: React.FC = () => {
  return <EmptyState isLoading loadingSubtitle={LOADING_SUB_TEXT} />;
};

type Props = ReturnType<typeof mapStateToProps>;
const ThreeDeePreview: React.FC<Props> = ({ selectedWellboreIds }: Props) => {
  const [isWellLogsRowDataFetching, setWellLogsRowDataFetching] =
    useState<boolean>(false);
  const [
    isWellFormationTopsRowDataFetching,
    setWellFormationTopsRowDataFetching,
  ] = useState<boolean>(false);

  const { data: config } = useWellConfig();
  const wells = useWellInspectSelectedWells();

  const { data: casingData, isLoading: casingLoading } =
    useSelectedWellboresCasingsQuery();
  const { data: ndsData, isLoading: ndsLoading } = useNdsEventsQuery();
  const { events: nptEvents, isLoading: nptLoading } = useNptEventsFor3D();

  const {
    trajectories,
    trajectoryRows,
    isLoading: trajectoriesLoading,
  } = useTrajectoriesQuery();

  const fetchWellLogsRowData = useFetchWellLogsRowData();
  const fetchWellFormationTopsRowData = useFetchWellFormationTopsRowData();

  const casings: Sequence[] = [];
  const logs: any = {};
  const logsFrmTops: any = {};
  const ndsEvents: CogniteEvent[] = [];

  const wellboreIds = useMemo(
    () =>
      Object.keys(selectedWellboreIds)
        .map((id) => String(id))
        .filter((id) => selectedWellboreIds[id]),
    [selectedWellboreIds]
  );
  const wellboreIdsNumber = useMemo(
    () =>
      Object.keys(selectedWellboreIds)
        .map((id) => Number(id))
        .filter((id) => selectedWellboreIds[id]),
    [selectedWellboreIds]
  );

  const { data: wellLogs, isLoading: isWellLogsLoading } =
    useWellLogsQuery(wellboreIdsNumber);
  const { data: wellFormationTops, isLoading: isWellFormationTopsLoading } =
    useWellFormationTopsQuery(wellboreIdsNumber);

  const isEventsLoading =
    casingLoading || ndsLoading || nptLoading || trajectoriesLoading;
  const isWellLogsDataLoading =
    !wellLogs || isWellLogsLoading || isWellLogsRowDataFetching;
  const isWellFormationTopsDataLoading =
    !wellFormationTops ||
    isWellFormationTopsLoading ||
    isWellFormationTopsRowDataFetching;

  const fetchRowDataForWellLogs = async () => {
    if (isWellLogsDataLoading) return;
    setWellLogsRowDataFetching(true);
    const sequences = flatten(Object.values(wellLogs)).map(
      (sequenceData) => sequenceData.sequence
    );
    await fetchWellLogsRowData(sequences);
    setWellLogsRowDataFetching(false);
  };

  const fetchRowDataForFormationTops = async () => {
    if (isWellFormationTopsDataLoading) return;
    setWellFormationTopsRowDataFetching(true);
    const sequences = flatten(Object.values(wellFormationTops)).map(
      (sequenceData) => sequenceData.sequence
    );
    await fetchWellFormationTopsRowData(sequences);
    setWellFormationTopsRowDataFetching(false);
  };

  useEffect(() => {
    fetchRowDataForWellLogs();
  }, [wellLogs, isWellLogsLoading]);

  useEffect(() => {
    fetchRowDataForFormationTops();
  }, [wellFormationTops, isWellFormationTopsLoading]);

  if (
    !config ||
    isEventsLoading ||
    isWellLogsDataLoading ||
    isWellFormationTopsDataLoading
  ) {
    return <ThreeDeeEmptyStateLoader />;
  }

  wellboreIds.forEach((wbid) => {
    if (casingData && casingData[wbid]) {
      casings.push(...orderedCasingsByBase(casingData[wbid]));
    }

    if (ndsData && isArray(ndsData[wbid])) {
      ndsEvents.push(...ndsData[wbid]);
    }

    logs[wbid] = get(wellLogs, wbid, []).map((logData) => ({
      assetId: logData.sequence.wellboreId,
      name: logData.sequence.name,
      items: logData.rows,
      state: 'LOADED',
    }));

    logsFrmTops[wbid] = get(wellFormationTops, wbid, []).map((logData) => ({
      assetId: logData.sequence.wellboreId,
      name: logData.sequence.name,
      items: logData.rows,
      state: 'LOADED',
    }));
  });

  const safeTrajectoryRows = trajectoryRows.map((row) => {
    return {
      ...row,
      columns: row.columns.map((column) => {
        return {
          ...column,
          // these should not be optional from project config!
          name: column.name || '',
          valueType: column.valueType || '',
        };
      }),
    };
  });

  return (
    <ThreeDee
      wells={wells}
      trajectories={trajectories}
      trajectoryData={safeTrajectoryRows}
      casings={casings}
      logs={logs}
      logsFrmTops={logsFrmTops}
      ndsEvents={ndsEvents}
      nptEvents={nptEvents}
    />
  );
};

/*
 * Rumesh:
 * Had to use redux connect method instead selector hooks to bind state with component to avoid recursively initiating the 3D component.
 *
 *
 */
const mapStateToProps = (state: StoreState) => ({
  selectedWellboreIds: state.wellInspect.selectedWellboreIds,
});

export default connect(mapStateToProps)(ThreeDeePreview);
