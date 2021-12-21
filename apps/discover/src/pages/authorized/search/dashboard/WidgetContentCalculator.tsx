import * as React from 'react';

import { getPercent } from '_helpers/getPercent';

import { WidgetContentWithLoading } from './WidgetContentWithLoading';

interface Props {
  selectedData: Set<unknown>;
  selectedDataLoading: boolean;
  completeData: Set<unknown>;
  completeDataLoading: boolean;
}
export const WidgetContentCalculator: React.FC<Props> = ({
  selectedData,
  selectedDataLoading,
  completeData,
  completeDataLoading,
}) => {
  const intersection = new Set(
    [...completeData].filter((x) => selectedData.has(x))
  );

  let mainText = `${intersection.size} / ${completeData.size}`;
  let percent = `${getPercent(intersection.size, completeData.size)}%`;

  if (completeDataLoading) {
    mainText = '';
  }

  if (selectedDataLoading) {
    percent = '';
    mainText = `${completeData.size} wells`;
  }

  return <WidgetContentWithLoading mainText={mainText} percent={percent} />;
};
