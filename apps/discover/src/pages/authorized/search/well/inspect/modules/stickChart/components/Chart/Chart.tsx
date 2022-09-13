import React from 'react';

import head from 'lodash/head';
import isString from 'lodash/isString';
import last from 'lodash/last';

import { useDeepMemo } from 'hooks/useDeep';

import { ChartV2 } from '../../../common/ChartV2';
import { ChartProps as CommonChartProps } from '../../../common/ChartV2/ChartV2';
import { SCALE_BLOCK_HEIGHT } from '../../../common/Events/constants';
import { DepthScaleLines } from '../DepthScaleLines';

import { ChartContentWrapper, ChartTitle, ChartWrapper } from './elements';

export interface ChartProps
  extends Pick<CommonChartProps, 'data' | 'axisNames'> {
  scaleBlocks: number[];
  header?: string;
}

export const Chart: React.FC<ChartProps> = React.memo(
  ({ data, axisNames, scaleBlocks, header }) => {
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

    const renderHeader = () => {
      if (isString(header)) {
        return <ChartTitle>{header}</ChartTitle>;
      }
      return header;
    };

    return (
      <ChartWrapper>
        <DepthScaleLines scaleBlocks={scaleBlocks} />

        {renderHeader()}

        <ChartContentWrapper>
          <ChartV2
            autosize
            hideHeader
            axisNames={axisNames}
            axisConfig={axisConfig}
            data={data}
            title=""
            height={height}
          />
        </ChartContentWrapper>
      </ChartWrapper>
    );
  }
);
