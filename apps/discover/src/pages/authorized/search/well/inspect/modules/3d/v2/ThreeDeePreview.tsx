import React, { useMemo, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import flatten from 'lodash/flatten';
import get from 'lodash/get';
import isArray from 'lodash/isArray';

import { Sequence, CogniteEvent } from '@cognite/sdk';

import { ThreeDee } from 'components/3d-old';
import EmptyState from 'components/emptyState';
import { LOADING_SUB_TEXT } from 'components/emptyState/constants';
import { StoreState } from 'core/types';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import { useSelectedWellboresCasingsQuery } from 'modules/wellSearch/hooks/useSelectedWellboresCasingsQuery';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { SequenceData } from 'modules/wellSearch/types';
import { orderedCasingsByBase } from 'modules/wellSearch/utils/casings';

import { useFetchWellFormationTopsRowData } from '../../logType/v2/hooks/useFetchWellFormationTopsRowData';
import { useFetchWellLogsRowData } from '../../logType/v2/hooks/useFetchWellLogsRowData';
import { useWellFormationTopsQuery } from '../../logType/v2/hooks/useWellFormationTopsQuery';
import { useWellLogsQuery } from '../../logType/v2/hooks/useWellLogsQuery';

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
  const { data: nptEvents, isLoading: nptLoading } = useNptEventsQuery();
  const {
    trajectories,
    trajectoryRows,
    isLoading: trajectoriesLoading,
  } = useTrajectoriesQuery();
  const fetchWellLogsRowData = useFetchWellLogsRowData();
  const fetchWellFormationTopsRowData = useFetchWellFormationTopsRowData();

  const casings: Sequence[] = [];
  const logs: Record<string, SequenceData[]> = {};
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

    logs[wbid] = get(wellLogs, wbid, []) || [];

    // move this into the normalize functions like the other types:
    logsFrmTops[wbid] = get(wellFormationTops, wbid, []).map((logData) => ({
      assetId: logData.sequence.wellboreId,
      name: logData.sequence.name,
      items: logData.rows,
      state: 'LOADED',
    }));
  });

  return (
    <ThreeDee
      wells={wells}
      trajectories={trajectories}
      trajectoryData={trajectoryRows}
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
