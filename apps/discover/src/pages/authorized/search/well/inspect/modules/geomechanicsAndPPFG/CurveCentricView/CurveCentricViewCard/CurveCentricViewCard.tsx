import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { MeasurementsChart } from '../../components/MeasurementsChart';
import { MeasurementUnits } from '../../types';

import { CurveCentricViewCardWrapper } from './elements';

export interface CurveCentricViewCardProps {
  data: MeasurementCurveData[];
  measurementUnits: MeasurementUnits;
  visible?: boolean;
}

export const CurveCentricViewCard: React.FC<CurveCentricViewCardProps> = ({
  data,
  measurementUnits,
  visible = true,
}) => {
  if (isEmpty(data)) {
    return null;
  }

  const { columnExternalId, measurementTypeParent } = data[0];

  const subtitle =
    columnExternalId !== measurementTypeParent
      ? measurementTypeParent
      : undefined;

  return (
    <CurveCentricViewCardWrapper
      visible={visible}
      data-testid="curve-centric-view-card"
    >
      <MeasurementsChart
        data={data}
        title={columnExternalId}
        subtitle={subtitle}
        measurementUnits={measurementUnits}
      />
    </CurveCentricViewCardWrapper>
  );
};
