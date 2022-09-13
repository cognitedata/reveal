import React, { useCallback, useEffect, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { PlotData } from 'plotly.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';

import { ChartProps } from '../../../common/ChartV2/ChartV2';
import { Chart } from '../Chart';
import { ColumnAction } from '../ColumnAction';
import { ColumnEmptyState } from '../ColumnEmptyState';
import { ExpandableColumn } from '../ExpandableColumn';

export interface PlotlyChartColumnProps extends Pick<ChartProps, 'axisNames'> {
  data?: Partial<PlotData>[];
  scaleBlocks: number[];
  header: string;
  chartHeader: string;
  isLoading?: boolean;
  emptySubtitle?: string;
  actionMessage?: string;
  actionButtonText?: string;
  onClickActionButton?: () => void;
}

export const PlotlyChartColumn: React.FC<
  WithDragHandleProps<PlotlyChartColumnProps>
> = React.memo(
  ({
    data = EMPTY_ARRAY,
    axisNames,
    scaleBlocks,
    header,
    chartHeader,
    isLoading,
    emptySubtitle,
    actionMessage,
    actionButtonText,
    onClickActionButton,
    ...dragHandleProps
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [lastExpandedState, setLastExpandedState] = useState(false);
    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
      if (isEmpty(data)) {
        setLastExpandedState(expanded);
        handleToggleExpand(false);
      } else {
        handleToggleExpand(lastExpandedState);
      }
    }, [isEmpty(data)]);

    const handleToggleExpand = useCallback((expanded: boolean) => {
      setExpanded(expanded);
      if (expanded) {
        setTimeout(() => setShowChart(true), 200);
      } else {
        setShowChart(false);
      }
    }, []);

    const renderContent = () => {
      if (isEmpty(data) || isLoading) {
        return (
          <ColumnEmptyState
            isLoading={isLoading}
            emptySubtitle={emptySubtitle}
          />
        );
      }

      if (actionMessage) {
        return (
          <ColumnAction
            actionMessage={actionMessage}
            actionButtonText={actionButtonText}
            onClickActionButton={onClickActionButton}
          />
        );
      }

      if (!expanded && !showChart) {
        return (
          <ColumnAction
            actionButtonText="See graph"
            onClickActionButton={() => handleToggleExpand(true)}
          />
        );
      }

      if (showChart) {
        return (
          <Chart
            data={data}
            axisNames={axisNames}
            scaleBlocks={scaleBlocks}
            header={chartHeader}
          />
        );
      }

      return null;
    };

    return (
      <ExpandableColumn
        expanded={expanded}
        header={header}
        disableExpandButton={isEmpty(data) || Boolean(actionMessage)}
        onToggleExpand={handleToggleExpand}
        {...dragHandleProps}
      >
        {renderContent()}
      </ExpandableColumn>
    );
  }
);
