/* eslint-disable react/no-unused-prop-types */
// false positive as noted here:
// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md#false-positives-sfc
import * as React from 'react';

import { getFixedPercent } from 'utils/number';

import { WidgetContentWithLoading } from './WidgetContentWithLoading';

interface Props {
  selectedData: Set<unknown>;
  selectedDataLoading: boolean;
  completeData: Set<unknown>;
  completeDataLoading: boolean;
}

const useContentCalculation = ({
  selectedData,
  selectedDataLoading,
  completeData,
  completeDataLoading,
}: Props) => {
  const intersection = new Set(
    [...completeData].filter((x) => selectedData.has(x))
  );

  let percent;
  let mainText;

  if (completeDataLoading) {
    mainText = '';
  } else {
    mainText = `${intersection.size} / ${completeData.size}`;
  }

  if (selectedDataLoading) {
    mainText = `${completeData.size} wells`;
  } else {
    percent = getFixedPercent(intersection.size, completeData.size);
  }

  return { percent, mainText };
};

export const WidgetContentCalculator: React.FC<Props> = (props) => {
  const { mainText, percent } = useContentCalculation(props);

  return <WidgetContentWithLoading mainText={mainText} percent={percent} />;
};
