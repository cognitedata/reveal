import * as React from 'react';

import { ViewModeControl } from '../../../common/ViewModeControl';

import { TrajectoryCurveSelectorWrapper } from './elements';

export interface TrajectoryCurveSelectorProps {
  curves: string[];
  selectedCurve: string;
  onChangeCurve: (curve: string) => void;
}

export const TrajectoryCurveSelector: React.FC<
  TrajectoryCurveSelectorProps
> = ({ curves, selectedCurve, onChangeCurve }) => {
  return (
    <TrajectoryCurveSelectorWrapper>
      <ViewModeControl
        size="small"
        views={curves}
        selectedView={selectedCurve}
        onChangeView={onChangeCurve}
      />
    </TrajectoryCurveSelectorWrapper>
  );
};
