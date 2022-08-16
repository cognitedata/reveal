import React, { useEffect, useRef, useState } from 'react';

import head from 'lodash/head';

import { useDeepCallback, useDeepMemo } from 'hooks/useDeep';

import { MeasurementCurveData } from '../../types';

import { ChartLegendItem } from './ChartLegendItem';
import { ChartLegendWrapper, LegendsHolder } from './elements';
import { ShowAllButton } from './ShowAllButton';

const LEGEND_LINE_HEIGHT = 21;

export interface GraphLegendProps {
  data: MeasurementCurveData[];
  formatCustomData?: (curve: MeasurementCurveData) => string[];
}

export const ChartLegend: React.FC<GraphLegendProps> = ({
  data,
  formatCustomData,
}) => {
  const legendRef = useRef<HTMLElement>(null);

  const [showAll, setShowAll] = useState<boolean>(false);
  const [displayShowAllButton, setDisplayShowAllButton] =
    useState<boolean>(false);

  const legendItemLinesHeight = useDeepMemo(() => {
    const firstDataElement = head(data);
    const customDataLinesCount =
      firstDataElement && formatCustomData
        ? formatCustomData(firstDataElement).length
        : 0;
    const legendItemLinesCount = customDataLinesCount + 1;
    return legendItemLinesCount * LEGEND_LINE_HEIGHT;
  }, [data, formatCustomData]);

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
          <ChartLegendItem
            key={curve.id}
            curve={curve}
            formatCustomData={formatCustomData}
          />
        ))}
      </LegendsHolder>

      {displayShowAllButton && <ShowAllButton onClick={setShowAll} />}
    </ChartLegendWrapper>
  );
};
