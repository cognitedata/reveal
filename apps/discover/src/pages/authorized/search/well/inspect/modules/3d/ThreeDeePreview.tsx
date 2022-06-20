import { useCasingSchematicsQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsQuery';
import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { useWellLogsWithRowData } from 'domain/wells/log/internal/queries/useWellLogsWithRowData';
import { useTrajectoriesQuery } from 'domain/wells/trajectory/internal/queries/useTrajectoriesQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWells';

import React, { useMemo } from 'react';
import { connect } from 'react-redux';

import isArray from 'lodash/isArray';

import { ThreeDee } from 'components/3d';
import EmptyState from 'components/EmptyState';
import { LOADING_SUB_TEXT } from 'components/EmptyState/constants';
import { StoreState } from 'core/types';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { CogniteEventV3ish } from 'modules/wellSearch/types';
import { keyBySource } from 'modules/wellSearch/utils/groupBySource';
import { groupByWellbore } from 'modules/wellSearch/utils/groupByWellbore';

const ThreeDeeEmptyStateLoader: React.FC = () => {
  return <EmptyState isLoading loadingSubtitle={LOADING_SUB_TEXT} />;
};

type Props = ReturnType<typeof mapStateToProps>;
const ThreeDeePreview: React.FC<Props> = ({ selectedWellboreIds }: Props) => {
  const { data: config } = useWellConfig();
  const wells = useWellInspectSelectedWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data: casingData, isLoading: casingLoading } =
    useCasingSchematicsQuery({ wellboreIds });
  const { data: ndsData, isLoading: ndsLoading } = useNdsEventsQuery();
  const { data: nptEvents, isLoading: nptLoading } = useNptEventsQuery();
  const {
    trajectories,
    trajectoryRows,
    isLoading: trajectoriesLoading,
  } = useTrajectoriesQuery();

  const ndsEvents: CogniteEventV3ish[] = [];

  /**
   * ************PP-2693************
   * DISABLING WELL LOGS IN 3D TEMPORARILY.
   */
  const {
    wellLogs,
    wellLogsRowData,
    // isLoading: isWellLogsLoading,
  } = useWellLogsWithRowData();

  // trigger build
  const isLoading =
    casingLoading || ndsLoading || nptLoading || trajectoriesLoading; // || isWellLogsLoading;

  const casings = useMemo(
    () =>
      (casingData || []).map(({ casingAssemblies, ...rest }) => ({
        ...rest,
        casingAssemblies: sortCasingAssembliesByMDBase(casingAssemblies),
      })),
    [casingData, casingLoading]
  );

  if (!config || isLoading) {
    return <ThreeDeeEmptyStateLoader />;
  }

  Object.keys(selectedWellboreIds).forEach((wbid) => {
    if (ndsData && isArray(ndsData[wbid])) {
      ndsEvents.push(...ndsData[wbid]);
    }
  });

  return (
    <ThreeDee
      wells={wells}
      trajectories={trajectories}
      trajectoryData={trajectoryRows}
      casings={casings}
      ndsEvents={ndsEvents}
      nptEvents={nptEvents}
      wellLogs={wellLogs.length ? groupByWellbore(wellLogs) : undefined}
      wellLogsRowData={keyBySource(wellLogsRowData)}
    />
  );
};

/*
 * Rumesh:
 * Had to use redux connect method instead selector hooks to bind state with component to avoid recursively initiating the 3D component.
 */
const mapStateToProps = (state: StoreState) => ({
  selectedWellboreIds: state.wellInspect.selectedWellboreIds,
});

export default connect(mapStateToProps)(ThreeDeePreview);
