import React from 'react';

import { FlexColumn, FlexRow } from 'styles/layout';

import CurveColorCode from '../../../common/ChartV2/CurveColorCode';
import { MeasurementCurveData } from '../../types';

import { CurveColorCodeWrapper, CurveName, LegendCustomData } from './elements';

export interface GraphLegendItemProps {
  curve: MeasurementCurveData;
  formatCustomData?: (curve: MeasurementCurveData) => string[];
}

export const ChartLegendItem: React.FC<GraphLegendItemProps> = ({
  curve,
  formatCustomData,
}) => {
  const { line, marker, curveName } = curve;

  return (
    <FlexRow>
      <CurveColorCodeWrapper>
        <CurveColorCode line={line} marker={marker} />
      </CurveColorCodeWrapper>

      <FlexColumn>
        <CurveName>{curveName}</CurveName>

        {formatCustomData?.(curve).map((customDataElement) => (
          <LegendCustomData key={customDataElement}>
            {customDataElement}
          </LegendCustomData>
        ))}
      </FlexColumn>
    </FlexRow>
  );
};
