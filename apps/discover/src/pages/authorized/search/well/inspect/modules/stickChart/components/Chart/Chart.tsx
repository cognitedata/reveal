import React from 'react';

import head from 'lodash/head';
import last from 'lodash/last';

import { useDeepMemo } from 'hooks/useDeep';

import { ChartV2 } from '../../../common/ChartV2';
import { ChartProps as CommonChartProps } from '../../../common/ChartV2/ChartV2';
import { SCALE_BLOCK_HEIGHT } from '../../../common/Events/constants';
import { getNativeScaleBlocks } from '../../utils/scale/getNativeScaleBlocks';
import { DEFAULT_CHART_WIDTH } from '../../WellboreStickChart/constants';
import { DepthScaleLines } from '../DepthScaleLines';

import {
  ChartColumnContent,
  ChartContentWrapper,
  ChartHeader,
  ChartNativeScaleContainer,
  ChartWrapper,
  ChartYTitle,
} from './elements';
import { NativeScale } from './NativeScale';

export interface ChartProps
  extends Pick<CommonChartProps, 'data' | 'axisNames'> {
  scaleBlocks: number[];
  header?: string | JSX.Element;
  reverseYAxis?: boolean;
  nativeScale?: boolean;
  width?: number;
}

export const Chart: React.FC<ChartProps> = React.memo(
  ({
    data,
    axisNames,
    scaleBlocks: scaleBlocksOriginal,
    header,
    reverseYAxis = false,
    nativeScale = false,
    width = DEFAULT_CHART_WIDTH,
  }) => {
    const scaleBlocks = useDeepMemo(() => {
      const chartScaleBlocks = nativeScale
        ? getNativeScaleBlocks(scaleBlocksOriginal, head(data)?.y)
        : scaleBlocksOriginal;
      if (reverseYAxis) {
        return chartScaleBlocks.reverse();
      }
      return chartScaleBlocks;
    }, [scaleBlocksOriginal, nativeScale, reverseYAxis]);

    const axisConfig = useDeepMemo(() => {
      return {
        x: {
          fixedrange: true,
        },
        y: {
          nticks: scaleBlocks.length,
          range: [last(scaleBlocks), head(scaleBlocks)],
          autorange: false,
          fixedrange: true,
          showticklabels: false,
          showgrid: false,
          zeroline: false,
        },
      };
    }, [scaleBlocks]);

    const height = useDeepMemo(
      () => (scaleBlocks.length + 1) * SCALE_BLOCK_HEIGHT,
      [scaleBlocks]
    );

    return (
      <ChartWrapper>
        <ChartHeader>{header}</ChartHeader>
        <DepthScaleLines scaleBlocks={scaleBlocks} />

        <ChartColumnContent>
          {nativeScale && (
            <ChartNativeScaleContainer>
              <ChartYTitle>{axisNames?.y}</ChartYTitle>
              <NativeScale scaleBlocks={scaleBlocks} />
            </ChartNativeScaleContainer>
          )}

          <ChartContentWrapper width={width}>
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
        </ChartColumnContent>
      </ChartWrapper>
    );
  }
);
