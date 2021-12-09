import React, { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import has from 'lodash/has';

import { Sequence } from '@cognite/sdk';

import { WhiteLoader } from 'components/loading';
import { Table, ColumnType, RowProps } from 'components/tablev3';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataTrajectory } from 'modules/filterData/selectors';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useSecondarySelectedOrHoveredWellbores } from 'modules/wellSearch/selectors';
import { Wellbore } from 'modules/wellSearch/types';

import { WellboreSelectionWrapper } from '../../elements';
import WellboreSelectionDropdown from '../common/WellboreSelectionDropdown';

import { Trajectory2D } from './Trajectory2D/Trajectory2D';
import { mapSelectedWellbores } from './utils';

const tableOptions = {
  checkable: true,
  flex: false,
  height: '100%',
};

export const Trajectory: React.FC = () => {
  const wellbores = useSecondarySelectedOrHoveredWellbores();

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

  const selectedWellboresTrajectories = useMemo(
    () =>
      trajectories.filter(
        (trajectory) => selectedWellboreIds[trajectory.assetId as number]
      ),
    [selectedWellboreIds, trajectories]
  );

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

  const selectedWellbores = useMemo(
    () => wellbores.filter((wellbore) => selectedWellboreIds[wellbore.id]),
    [selectedWellboreIds, wellbores]
  );

  useEffect(() => {
    // Set new wellbores as selected wellbored in trajectory tab
    const selectedWellboreIdsMap: { [key: number]: boolean } = wellbores
      .filter((wellbore) => !has(selectedWellboreIds, wellbore.id))
      .reduce((result, item) => ({ ...result, [item.id]: true }), {});
    if (Object.keys(selectedWellboreIdsMap).length) {
      dispatch(
        filterDataActions.setSelectedTrajectoryWellboreIds(
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
        filterDataActions.setSelectedTrajIds(selectedTrajectoriesIdsMap)
      );
    }
  }, [trajectories, selectedIds]);

  const onSelectWellbore = (selectedWellboreList: Wellbore[]) => {
    // Create wellbore Ids map with selected wellbore ids as true and others as false;
    const selectedWellboreIdsMap = mapSelectedWellbores(
      selectedWellboreList,
      selectedWellboreIds
    );
    dispatch(
      filterDataActions.setSelectedTrajectoryWellboreIds(selectedWellboreIdsMap)
    );
  };

  const handleRowSelect = (traj: RowProps<Sequence>, value: boolean) => {
    dispatch(
      filterDataActions.setSelectedTrajIds({ [traj.original.id]: value })
    );
  };

  const handleRowsSelect = (value: boolean) => {
    const selectedTrajectoriesIdsMap = selectedWellboresTrajectories.reduce(
      (result, item) => ({ ...result, [item.id]: value }),
      {}
    );
    dispatch(filterDataActions.setSelectedTrajIds(selectedTrajectoriesIdsMap));
  };

  const showWellWellboreDropdown = false;
  const showTrajectoryTable = false;

  if (isLoading) {
    return <WhiteLoader />;
  }
  return (
    <>
      <WellboreSelectionWrapper>
        <WellboreSelectionDropdown
          onSelectWellbore={onSelectWellbore}
          allWellbores={wellbores}
          selectedWellbores={selectedWellbores}
        />
      </WellboreSelectionWrapper>

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
        selectedWellbores={selectedWellbores}
        showWellWellboreDropdown={showWellWellboreDropdown}
        onSelectWellbore={onSelectWellbore}
        wellbores={wellbores}
      />
    </>
  );
};

export default Trajectory;
