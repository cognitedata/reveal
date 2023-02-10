import React, { useCallback, useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { PlotData } from 'plotly.js';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';

import { ChartProps } from '../../../common/ChartV2/ChartV2';
import { ColumnVisibilityProps } from '../../types';
import { hasAtLeasOneValidValue } from '../../utils/hasAtLeasOneValidValue';
import { Chart } from '../Chart';
import { ColumnAction } from '../ColumnAction';
import { ColumnEmptyState } from '../ColumnEmptyState';
import { ExpandableColumn } from '../ExpandableColumn';

export interface PlotlyChartColumnProps
  extends ColumnVisibilityProps,
    Pick<ChartProps, 'axisNames'> {
  id: string;
  data?: Partial<PlotData>[];
  secondaryData?: Partial<PlotData>[];
  scaleBlocks: number[];
  columnHeader: string | JSX.Element;
  chartHeader?: string | JSX.Element;
  isLoading?: boolean;
  emptySubtitle?: string;
  actionMessage?: string;
  actionButtonText?: string;
  reverseYAxis?: boolean;
  nativeScale?: boolean;
  chartWidth?: number;
  onClickActionButton?: () => void;
}

export const PlotlyChartColumn: React.FC<
  WithDragHandleProps<PlotlyChartColumnProps>
> = React.memo(
  ({
    isVisible = true,
    id,
    data: primaryData = EMPTY_ARRAY,
    secondaryData = EMPTY_ARRAY,
    axisNames,
    scaleBlocks,
    columnHeader,
    chartHeader,
    isLoading,
    emptySubtitle,
    actionMessage,
    actionButtonText,
    reverseYAxis,
    nativeScale,
    chartWidth,
    onClickActionButton,
    ...dragHandleProps
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [lastExpandedState, setLastExpandedState] = useState(false);
    const [showChart, setShowChart] = useState(false);

    const data = useMemo(
      () => [...primaryData, ...secondaryData],
      [primaryData, secondaryData]
    );

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
      if (isEmpty(data) || isLoading || !hasAtLeasOneValidValue(data)) {
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
            reverseYAxis={reverseYAxis}
            nativeScale={nativeScale}
            width={chartWidth}
          />
        );
      }

      return null;
    };

    return (
      <ExpandableColumn
        isVisible={isVisible}
        id={id}
        expanded={expanded}
        widthExpanded={chartWidth}
        header={columnHeader}
        disableExpandButton={isEmpty(data) || Boolean(actionMessage)}
        onToggleExpand={handleToggleExpand}
        {...dragHandleProps}
      >
        {renderContent()}
      </ExpandableColumn>
    );
  }
);
