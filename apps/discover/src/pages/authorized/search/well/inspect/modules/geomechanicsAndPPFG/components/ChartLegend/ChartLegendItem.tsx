import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import head from 'lodash/head';

import { FlexColumn, FlexRow } from 'styles/layout';

import CurveColorCode from '../../../common/ChartV2/CurveColorCode';

import { CurveColorCodeWrapper, CurveName, LegendCustomData } from './elements';

export interface GraphLegendItemProps {
  curve: MeasurementCurveData;
}

export const ChartLegendItem: React.FC<GraphLegendItemProps> = ({ curve }) => {
  const { line, marker, customdata = [] } = curve;

  const customDataHeader = head(customdata);
  const customDataSubContent = customdata.slice(1);

  return (
    <FlexRow>
      <CurveColorCodeWrapper>
        <CurveColorCode line={line} marker={marker} />
      </CurveColorCodeWrapper>

      <FlexColumn>
        <CurveName>{customDataHeader}</CurveName>

        {customDataSubContent.map((customDataElement) => (
          <LegendCustomData key={customDataElement}>
            {customDataElement}
          </LegendCustomData>
        ))}
      </FlexColumn>
    </FlexRow>
  );
};
