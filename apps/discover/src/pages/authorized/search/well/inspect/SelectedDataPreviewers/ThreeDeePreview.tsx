import React, { useMemo, useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';

import { Sequence, CogniteEvent } from '@cognite/sdk';

import { ThreeDee } from 'components/3d';
import EmptyState from 'components/emptyState';
import { LOADING_SUB_TEXT } from 'components/emptyState/constants';
import { LOG_THREE_DEE_PREVIEW, LOG_WELLS_THREE_DEE } from 'constants/logging';
import { StoreState } from 'core/types';
import {
  useCreateMetricAndStartTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useSelectedWellboresCasingsQuery } from 'modules/wellSearch/hooks/useSelectedWellboresCasingsQuery';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import {
  useNptEventsFor3D,
  useSecondarySelectedOrHoveredWells,
  useWellboreAssetIdMap,
} from 'modules/wellSearch/selectors';
import { Well } from 'modules/wellSearch/types';
import {
  mapWellboresToThreeD,
  mapWellsToThreeD,
} from 'modules/wellSearch/utils';
import { orderedCasingsByBase } from 'modules/wellSearch/utils/casings';

const ThreeDeeEmptyStateLoader: React.FC = () => {
  return <EmptyState isLoading loadingSubtitle={LOADING_SUB_TEXT} />;
};

type Props = ReturnType<typeof mapStateToProps>;
const ThreeDeePreview: React.FC<Props> = ({
  selectedWellboreIds,
  wellboreData,
}: Props) => {
  const renderTimer = useCreateMetricAndStartTimeLogger(
    TimeLogStages.Render,
    LOG_THREE_DEE_PREVIEW,
    LOG_WELLS_THREE_DEE
  );
  const [loadingMap, setLoadingMap] = React.useState<{
    [key: string]: boolean;
  }>({});

  const dispatch = useDispatch();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const selectedOrHoveredWells = useSecondarySelectedOrHoveredWells();

  const { data: casingData, isLoading: casingLoading } =
    useSelectedWellboresCasingsQuery();
  const { data: ndsData, isLoading: ndsLoading } = useNdsEventsQuery();
  const { events: nptEvents, isLoading: nptLoading } = useNptEventsFor3D();

  const {
    trajectories,
    trajectoryRows,
    isLoading: trajectoriesLoading,
  } = useTrajectoriesQuery();

  const casings: Sequence[] = [];
  const logs: any = {};
  const logsFrmTops: any = {};
  const ndsEvents: CogniteEvent[] = [];

  const selectedWells: Well[] = useMemo(
    () => mapWellsToThreeD(selectedOrHoveredWells),
    [selectedOrHoveredWells]
  );

  const selectedWellbores = useMemo(
    () => mapWellboresToThreeD(selectedWells),
    [selectedWells]
  );

  const wbIds = useMemo(
    () =>
      Object.keys(selectedWellboreIds)
        .map((id) => Number(id))
        .filter((id) => selectedWellboreIds[id]),
    [selectedWellboreIds]
  );

  const pristineIds = useMemo(() => {
    const logsPristineIds: number[] = [];
    const logsRowPristineIds: Sequence[] = [];
    const logsFrmTopsRowPristineIds: Sequence[] = [];

    wbIds.forEach((wbid) => {
      // Get Wellbore ids to fetch logs
      if (!wellboreData[wbid]?.logType) {
        logsPristineIds.push(wbid);
      }

      // Get Logs ids to fetch logs row data
      if (wellboreData[wbid] && wellboreData[wbid].logType) {
        (wellboreData[wbid].logType || []).forEach((logData) => {
          if (!logData.rows) {
            logsRowPristineIds.push(logData.sequence);
          }
        });
      }

      // Get LogsFrmTops ids to fetch logsfrmTops row data
      if (wellboreData[wbid] && wellboreData[wbid].logsFrmTops) {
        (wellboreData[wbid].logsFrmTops || []).forEach((logData) => {
          if (!logData.rows) {
            logsFrmTopsRowPristineIds.push(logData.sequence);
          }
        });
      }
    });
    return {
      logs: logsPristineIds,
      logsRows: logsRowPristineIds,
      logsFrmTopsRows: logsFrmTopsRowPristineIds,
    };
  }, [wellboreData]);

  const isLogsPristineIdsNotEmpty = pristineIds.logs.length > 0;
  const isLogsRowsPristineIdsNotEmpty = pristineIds.logsRows.length > 0;
  const isEventsLoading =
    casingLoading || ndsLoading || nptLoading || trajectoriesLoading;

  useEffect(() => {
    // Fetch logs
    if (isLogsPristineIdsNotEmpty && !loadingMap.Logs) {
      dispatch(
        wellSearchActions.getLogType(
          pristineIds.logs,
          wellboreAssetIdMap,
          config?.logs?.queries,
          config?.logs?.types
        )
      );
      setLoading({ Logs: true });
    }
  }, [isLogsPristineIdsNotEmpty, loadingMap.Logs]);

  useEffect(() => {
    // Fetch logs rows
    if (isLogsRowsPristineIdsNotEmpty && !loadingMap.logsRows) {
      dispatch(
        wellSearchActions.getLogData(
          pristineIds.logsRows,
          pristineIds.logsFrmTopsRows
        )
      );
      setLoading({ LogsRows: true });
    }
  }, [isLogsRowsPristineIdsNotEmpty, loadingMap.Logs]);

  useEffect(() => renderTimer?.stop(), [renderTimer]);

  const setLoading = useCallback(
    (data) => setLoadingMap((state) => ({ ...state, ...data })),
    []
  );

  if (!config) {
    return <ThreeDeeEmptyStateLoader />;
  }
  // Show loader while fetching events
  if (isEventsLoading) {
    return <ThreeDeeEmptyStateLoader />;
  }
  // Show loader while fetching logs
  if (isLogsPristineIdsNotEmpty) {
    return <ThreeDeeEmptyStateLoader />;
  }
  // Show loader while fetching logs rows
  if (isLogsRowsPristineIdsNotEmpty) {
    return <ThreeDeeEmptyStateLoader />;
  }

  wbIds.forEach((wbid) => {
    if (casingData) {
      casings.push(...orderedCasingsByBase(casingData[wbid]));
    }

    if (ndsData) {
      ndsEvents.push(...ndsData[wbid]);
    }

    logs[wbid] = (wellboreData[wbid].logType || []).map((logData) => ({
      assetId: logData.sequence.assetId,
      name: logData.sequence.name,
      items: logData.rows,
      state: 'LOADED',
    }));

    logsFrmTops[wbid] = (wellboreData[wbid].logsFrmTops || []).map(
      (logData) => ({
        assetId: logData.sequence.assetId,
        name: logData.sequence.name,
        items: logData.rows,
        state: 'LOADED',
      })
    );
  });

  return (
    <ThreeDee
      {...{
        wells: selectedWells as any[],
        wellBores: selectedWellbores as any[],
        trajectories: trajectories as any[],
        trajectoryData: trajectoryRows,
        casings,
        logs,
        logsFrmTops,
        ndsEvents,
        nptEvents: nptEvents as any[],
      }}
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
  selectedWellboreIds: state.wellSearch.selectedSecondaryWellboreIds,
  wellboreData: state.wellSearch.wellboreData,
});

export default connect(mapStateToProps)(ThreeDeePreview);
