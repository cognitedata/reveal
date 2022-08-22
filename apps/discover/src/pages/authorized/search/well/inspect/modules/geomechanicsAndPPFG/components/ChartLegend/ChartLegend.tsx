import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import React, { useEffect, useRef, useState } from 'react';

import head from 'lodash/head';

import { useDeepCallback, useDeepMemo } from 'hooks/useDeep';

import { ChartLegendItem } from './ChartLegendItem';
import { ChartLegendWrapper, LegendsHolder } from './elements';
import { ShowAllButton } from './ShowAllButton';

const LEGEND_LINE_HEIGHT = 21;

export interface GraphLegendProps {
  data: MeasurementCurveData[];
}

export const ChartLegend: React.FC<GraphLegendProps> = ({ data }) => {
  const legendRef = useRef<HTMLElement>(null);

  const [showAll, setShowAll] = useState<boolean>(false);
  const [displayShowAllButton, setDisplayShowAllButton] =
    useState<boolean>(false);

  const legendItemLinesHeight = useDeepMemo(
    () => (head(data)?.customdata?.length || 1) * LEGEND_LINE_HEIGHT,
    [data]
  );

  const updateShowAllButtonVisibility = useDeepCallback(() => {
    setDisplayShowAllButton(
      Number(legendRef.current?.scrollHeight) > legendItemLinesHeight
    );
  }, [legendRef.current?.scrollHeight, legendItemLinesHeight]);

  useEffect(
    () => updateShowAllButtonVisibility(),
    [updateShowAllButtonVisibility]
  );

  return (
    <ChartLegendWrapper>
      <LegendsHolder
        ref={legendRef}
        expand={showAll}
        height={legendItemLinesHeight}
      >
        {data.map((curve) => (
          <ChartLegendItem key={curve.id} curve={curve} />
        ))}
      </LegendsHolder>

      {displayShowAllButton && <ShowAllButton onClick={setShowAll} />}
    </ChartLegendWrapper>
  );
};
