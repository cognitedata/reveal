import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import React, { useRef } from 'react';

import { FlexColumn } from 'styles/layout';

import { MeasurementsChart } from '../../../components/MeasurementsChart';
import { MeasurementUnits } from '../../../types';

export interface GraphColumnProps {
  data: MeasurementCurveData[];
  measurementUnits: MeasurementUnits;
  onMinMaxChange: ([min, max]: [number, number]) => void;
  onLayoutChange: (scaleBlockHeight: number, scaleBlocks: number[]) => void;
}

export const ChartColumn: React.FC<GraphColumnProps> = ({
  data,
  measurementUnits,
  onMinMaxChange,
  onLayoutChange,
}) => {
  const chartColumnRef = useRef<HTMLElement>(null);

  return (
    <FlexColumn ref={chartColumnRef}>
      <MeasurementsChart
        data={data}
        measurementUnits={measurementUnits}
        title="Geomechanics & PPFG"
        onMinMaxChange={(min, max) => onMinMaxChange([min, max])}
        onLayoutChange={onLayoutChange}
      />
    </FlexColumn>
  );
};
