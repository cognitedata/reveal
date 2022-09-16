import * as React from 'react';

import { ViewModeControl } from '../../../common/ViewModeControl';

import { TrajectoryCurveSelectorWrapper } from './elements';
import { TrajectoryCurve } from './types';

export interface TrajectoryCurveSelectorProps {
  curves: TrajectoryCurve[];
  selectedCurve: TrajectoryCurve;
  onChangeCurve: (curve: TrajectoryCurve) => void;
}

export const TrajectoryCurveSelector: React.FC<
  TrajectoryCurveSelectorProps
> = ({ curves, selectedCurve, onChangeCurve }) => {
  return (
    <TrajectoryCurveSelectorWrapper>
      <ViewModeControl<TrajectoryCurve>
        size="small"
        views={curves}
        selectedView={selectedCurve}
        onChangeView={onChangeCurve}
      />
    </TrajectoryCurveSelectorWrapper>
  );
};
