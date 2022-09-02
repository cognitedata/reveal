import React, { useCallback, useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import last from 'lodash/last';

import { ExpandCollapseIconButton } from 'components/Buttons';
import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { FlexGrow } from 'styles/layout';

import { ChartV2 } from '../../../common/ChartV2';
import { ChartProps } from '../../../common/ChartV2/ChartV2';
import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { SCALE_BLOCK_HEIGHT } from '../../../common/Events/constants';
import {
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import {
  CHART_COLUMN_WIDTH,
  CHART_COLUMN_WIDTH_COLLAPSED,
  DEFAULT_EXPAND_GRAPH_TEXT,
  LOADING_TEXT,
} from '../../WellboreStickChart/constants';
import { DepthScaleLines } from '../DepthScaleLines';

import {
  ChartTitle,
  ChartWrapper,
  ChartEmptyStateWrapper,
  ChartContainer,
} from './elements';

export interface PlotlyChartColumnProps
  extends Pick<ChartProps, 'data' | 'axisNames'> {
  header: string;
  title: string;
  scaleBlocks: number[];
  isLoading?: boolean;
  emptySubtitle?: string;
  expandSubtitle?: string;
}

export const PlotlyChartColumn: React.FC<
  WithDragHandleProps<PlotlyChartColumnProps>
> = React.memo(
  ({
    data,
    header,
    axisNames,
    title,
    scaleBlocks,
    isLoading,
    emptySubtitle,
    expandSubtitle = DEFAULT_EXPAND_GRAPH_TEXT,
    ...dragHandleProps
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [lastExpandedState, setLastExpandedState] = useState(false);
    const [showChart, setShowChart] = useState(false);

    useDeepEffect(() => {
      if (isEmpty(data)) {
        setLastExpandedState(expanded);
        handleExpandCollapse(false);
      } else {
        handleExpandCollapse(lastExpandedState);
      }
    }, [data]);

    const axisConfig = useDeepMemo(() => {
      return {
        x: {
          fixedrange: true,
        },
        y: {
          dtick: scaleBlocks[1] - scaleBlocks[0],
          nticks: scaleBlocks.length,
          range: [last(scaleBlocks), head(scaleBlocks)],
          autorange: false,
          fixedrange: true,
          showticklabels: false,
          showgrid: false,
        },
      };
    }, [scaleBlocks]);

    const height = useDeepMemo(
      () => (scaleBlocks.length + 1) * SCALE_BLOCK_HEIGHT,
      [scaleBlocks]
    );

    const ChartContent = useDeepMemo(() => {
      return (
        <>
          <ChartTitle>{title}</ChartTitle>

          <BodyColumnBody>
            <DepthScaleLines scaleBlocks={scaleBlocks} />
            <ChartWrapper>
              <ChartV2
                autosize
                hideHeader
                axisNames={axisNames}
                axisConfig={axisConfig}
                data={data}
                title={title}
                height={height}
              />
            </ChartWrapper>
          </BodyColumnBody>
        </>
      );
    }, [scaleBlocks, data]);

    const renderContent = () => {
      if (isEmpty(data)) {
        return (
          <ChartEmptyStateWrapper>
            <EmptyState
              isLoading={isLoading}
              loadingSubtitle={isLoading ? LOADING_TEXT : ''}
              emptySubtitle={emptySubtitle}
              hideHeading
            />
          </ChartEmptyStateWrapper>
        );
      }

      if (!expanded && !showChart) {
        return (
          <ChartEmptyStateWrapper>
            <EmptyState emptySubtitle={expandSubtitle} hideHeading />
          </ChartEmptyStateWrapper>
        );
      }

      if (showChart) {
        return ChartContent;
      }

      return null;
    };

    const handleExpandCollapse = useCallback((expanded: boolean) => {
      if (expanded) {
        setExpanded(true);
        setTimeout(() => setShowChart(true), 200);
      } else {
        setShowChart(false);
        setExpanded(false);
      }
    }, []);

    return (
      <ChartContainer
        width={expanded ? CHART_COLUMN_WIDTH : CHART_COLUMN_WIDTH_COLLAPSED}
      >
        <ColumnDragger {...dragHandleProps} />

        <ColumnHeaderWrapper>
          <BodyColumnMainHeader>{header}</BodyColumnMainHeader>
          <FlexGrow />
          <ExpandCollapseIconButton
            expanded={expanded}
            disabled={isEmpty(data)}
            onChange={handleExpandCollapse}
          />
        </ColumnHeaderWrapper>

        {renderContent()}
      </ChartContainer>
    );
  }
);
