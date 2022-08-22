import { useTrajectoryChartsConfig } from 'domain/wells/trajectory/internal/hooks/useTrajectoryChartsConfig';

import React, { useEffect, useState, Dispatch } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useDeepMemo } from 'hooks/useDeep';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { TrajectoryView } from '../types';
import { adaptToChartDataList } from '../utils/adaptToChartDataList';

import { FullSizedTrajectoryView, TrajectoryGrid } from './elements';
import { TrajectoryChart, TrajectoryChartProps } from './TrajectoryChart';

export interface TrajectoryGraphProps {
  data: TrajectoryView[];
  expandedChartIndex: number | undefined;
  setExpandedChartIndex: Dispatch<React.SetStateAction<number | undefined>>;
}

export const TrajectoryGraph: React.FC<TrajectoryGraphProps> = ({
  data,
  expandedChartIndex,
  setExpandedChartIndex,
}) => {
  const dispatch = useDispatch();
  const { data: config } = useWellConfig();

  const [autosizeGridView, setAutosizeGridView] = useState<boolean>(true);

  /**
   * Enable autosizing for grid view charts.
   * Since the autosizing is disabled when the full sized view is expanded,
   * the grid view is not resized even after the window size is changed.
   * Hence, this event listener enables autosizing for gird view if the window is resized.
   */
  useEffect(() => {
    const enableAutosizeGridView = () => {
      setAutosizeGridView(true);
    };
    window.addEventListener('resize', enableAutosizeGridView);
    return () => window.removeEventListener('resize', enableAutosizeGridView);
  }, []);

  const chartConfigs = useTrajectoryChartsConfig();

  const { data: charts, errors } = useDeepMemo(
    () => adaptToChartDataList(data, chartConfigs),
    [data, chartConfigs]
  );

  useEffect(() => {
    if (!errors || isEmpty(errors)) {
      return;
    }
    dispatch(inspectTabsActions.setErrors(errors));
  }, [errors]);

  const handleExpandFullSizedView = ({ index }: TrajectoryChartProps) => {
    setExpandedChartIndex(index);
    /**
     * Disable autosizing for grid view charts.
     * This is to prevent triggering an unnecessary resize after the full sized view is collapsed.
     */
    setAutosizeGridView(false);
  };

  const handleCollapseFullSizedView = () => {
    setExpandedChartIndex(undefined);
  };

  const renderTrajectoryFullSizedView = () => {
    if (isUndefined(expandedChartIndex)) {
      return null;
    }

    return (
      <FullSizedTrajectoryView>
        <TrajectoryChart
          data={charts[expandedChartIndex]}
          index={expandedChartIndex}
          onCollapse={handleCollapseFullSizedView}
        />
      </FullSizedTrajectoryView>
    );
  };

  if (!config) {
    return null;
  }

  return (
    <>
      <NoUnmountShowHide show={isUndefined(expandedChartIndex)}>
        <TrajectoryGrid>
          {charts.map((data, index) => (
            <TrajectoryChart
              // eslint-disable-next-line react/no-array-index-key
              key={`chart_${index}`}
              data={data}
              index={index}
              autosize={autosizeGridView}
              onExpand={() => handleExpandFullSizedView({ data, index })}
            />
          ))}
        </TrajectoryGrid>
      </NoUnmountShowHide>

      {renderTrajectoryFullSizedView()}
    </>
  );
};
