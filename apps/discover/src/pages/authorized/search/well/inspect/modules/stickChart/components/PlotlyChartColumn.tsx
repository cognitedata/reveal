import React from 'react';

import head from 'lodash/head';
import last from 'lodash/last';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { useDeepMemo } from 'hooks/useDeep';

import { ChartV2 } from '../../common/ChartV2';
import { ChartProps } from '../../common/ChartV2/ChartV2';
import { ColumnDragger } from '../../common/Events/ColumnDragger';
import { SCALE_BLOCK_HEIGHT } from '../../common/Events/constants';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
} from '../../common/Events/elements';

import { DepthScaleLines } from './DepthScaleLines';
import { ChartTitle, ChartWrapper } from './elements';

export interface PlotlyChartColumnProps
  extends Pick<ChartProps, 'data' | 'axisNames'> {
  header: string;
  title: string;
  scaleBlocks: number[];
  width?: number;
}

export const PlotlyChartColumn: React.FC<
  WithDragHandleProps<PlotlyChartColumnProps>
> = ({
  data,
  header,
  axisNames,
  title,
  scaleBlocks,
  width = 320,
  ...dragHandleProps
}) => {
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

  return (
    <BodyColumn width={width}>
      <ColumnDragger {...dragHandleProps} />

      <ColumnHeaderWrapper>
        <BodyColumnMainHeader>{header}</BodyColumnMainHeader>
      </ColumnHeaderWrapper>

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
    </BodyColumn>
  );
};
