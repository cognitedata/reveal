import { useTrajectoriesQuery } from 'domain/wells/trajectory/dataLayer/queries/useTrajectoriesQuery';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import has from 'lodash/has';

import { PerfMetrics } from '@cognite/metrics';

import { Loading } from 'components/Loading/Loading';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  trajectoryPageLoadQuery,
} from 'components/Performance';
import { Table, ColumnType, RowProps } from 'components/Tablev3';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useFilterDataTrajectory } from 'modules/inspectTabs/selectors';
import { Sequence } from 'modules/wellSearch/types';

import { Trajectory2D } from './Trajectory2D/Trajectory2D';

const tableOptions = {
  checkable: true,
  flex: false,
  height: '100%',
};

export const Trajectory: React.FC = () => {
  const wellbores = useWellInspectSelectedWellbores();

  const dispatch = useDispatch();

  const columns: ColumnType<Sequence>[] = [
    {
      Header: 'Well Name',
      accessor: 'metadata.wellName',
      width: '300px',
      maxWidth: '1fr',
    },
    {
      Header: 'Wellbore',
      accessor: 'metadata.wellboreName',
      width: '200px',
    },
    {
      Header: 'Source',
      width: '200px',
      accessor: 'metadata.source',
    },
  ];

  const { trajectories, trajectoryRows, isLoading } = useTrajectoriesQuery();

  const { selectedIds, selectedWellboreIds } = useFilterDataTrajectory();

  const selectedWellboresTrajectories = useMemo(() => {
    return trajectories.filter((trajectory) =>
      trajectory.assetId ? selectedWellboreIds[trajectory.assetId] : false
    );
  }, [selectedWellboreIds, trajectories]);

  const selectedTrajectories = useMemo(
    () =>
      selectedWellboresTrajectories.filter(
        (trajectory) => selectedIds[trajectory.id]
      ),
    [selectedIds, selectedWellboresTrajectories]
  );

  const selectedTrajectoryRows = useMemo(
    () =>
      trajectoryRows.filter((trajectoryRow) =>
        selectedTrajectories
          .map((trajectory) => trajectory.id)
          .includes(trajectoryRow.id)
      ),
    [selectedTrajectories, trajectoryRows]
  );

  // const selectedWellbores = useMemo(
  //   () => wellbores.filter((wellbore) => selectedWellboreIds[wellbore.id]),
  //   [selectedWellboreIds, wellbores]
  // );

  useEffect(() => {
    // Set new wellbores as selected wellbored in trajectory tab
    const selectedWellboreIdsMap: { [key: number]: boolean } = wellbores
      .filter((wellbore) => !has(selectedWellboreIds, wellbore.id))
      .reduce((result, item) => ({ ...result, [item.id]: true }), {});
    if (Object.keys(selectedWellboreIdsMap).length) {
      dispatch(
        inspectTabsActions.setSelectedTrajectoryWellboreIds(
          selectedWellboreIdsMap
        )
      );
    }
  }, [selectedWellboreIds, wellbores]);

  useEffect(() => {
    // Set new wellbores trajectories as selected trajectories in trajectory tab
    const selectedTrajectoriesIdsMap = trajectories
      .filter((trajectory) => !has(selectedIds, trajectory.id))
      .reduce((result, item) => ({ ...result, [item.id]: true }), {});
    if (Object.keys(selectedTrajectoriesIdsMap).length) {
      dispatch(
        inspectTabsActions.setSelectedTrajectoryIds(selectedTrajectoriesIdsMap)
      );
    }
  }, [trajectories, selectedIds]);

  const handleRowSelect = (traj: RowProps<Sequence>, value: boolean) => {
    dispatch(
      inspectTabsActions.setSelectedTrajectoryIds({ [traj.original.id]: value })
    );
  };

  const handleRowsSelect = (value: boolean) => {
    const selectedTrajectoriesIdsMap = selectedWellboresTrajectories.reduce(
      (result, item) => ({ ...result, [item.id]: value }),
      {}
    );
    dispatch(
      inspectTabsActions.setSelectedTrajectoryIds(selectedTrajectoriesIdsMap)
    );
  };

  const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.findInMutation({
        ...trajectoryPageLoadQuery,
        mutations,
        callback: (_output: any) => {
          PerfMetrics.trackPerfEnd('TRAJECTORY_PAGE_LOAD');
        },
      });
    }
  };

  const showTrajectoryTable = false;

  if (isLoading) {
    return <Loading />;
  }
  return (
    <>
      <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
        {showTrajectoryTable && (
          <Table<Sequence>
            scrollTable
            id="trajectory-result-table"
            data-testid="trajectory-result-table"
            data={selectedWellboresTrajectories}
            selectedIds={selectedIds}
            handleRowSelect={handleRowSelect}
            handleRowsSelect={handleRowsSelect}
            columns={columns}
            options={tableOptions}
            // renderChildren={PreviewSelector({ onApplyChanges })}
          />
        )}
        <Trajectory2D
          selectedTrajectoryData={selectedTrajectoryRows}
          selectedTrajectories={selectedTrajectories}
        />
      </PerformanceMetricsObserver>
    </>
  );
};

export default Trajectory;
