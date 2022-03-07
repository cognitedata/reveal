import React from 'react';
import { connect } from 'react-redux';

import isArray from 'lodash/isArray';

import { Sequence, CogniteEvent } from '@cognite/sdk';

import { ThreeDee } from 'components/3d';
import EmptyState from 'components/emptyState';
import { LOADING_SUB_TEXT } from 'components/emptyState/constants';
import { StoreState } from 'core/types';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
// import { useWellLogsWithRowData } from 'modules/wellInspect/hooks/useWellLogsWithRowData';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import { useSelectedWellboresCasingsQuery } from 'modules/wellSearch/hooks/useSelectedWellboresCasingsQuery';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { orderedCasingsByBase } from 'modules/wellSearch/utils/casings';
// import { keyBySource } from 'modules/wellSearch/utils/groupBySource';
// import { groupByWellbore } from 'modules/wellSearch/utils/groupByWellbore';

const ThreeDeeEmptyStateLoader: React.FC = () => {
  return <EmptyState isLoading loadingSubtitle={LOADING_SUB_TEXT} />;
};

type Props = ReturnType<typeof mapStateToProps>;
const ThreeDeePreview: React.FC<Props> = ({ selectedWellboreIds }: Props) => {
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

  const casings: Sequence[] = [];
  const ndsEvents: CogniteEvent[] = [];

  /**
   * ************PP-2693************
   * DISABLING WELL LOGS IN 3D TEMPORARILY.
   */
  // const {
  //   wellLogs,
  //   wellLogsRowData,
  //   isLoading: isWellLogsLoading,
  // } = useWellLogsWithRowData();

  const isLoading =
    casingLoading || ndsLoading || nptLoading || trajectoriesLoading; // || isWellLogsLoading

  if (!config || isLoading) {
    return <ThreeDeeEmptyStateLoader />;
  }

  Object.keys(selectedWellboreIds).forEach((wbid) => {
    if (casingData && casingData[wbid]) {
      casings.push(...orderedCasingsByBase(casingData[wbid]));
    }

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
      // wellLogs={groupByWellbore(wellLogs)}
      // wellLogsRowData={keyBySource(wellLogsRowData)}
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
