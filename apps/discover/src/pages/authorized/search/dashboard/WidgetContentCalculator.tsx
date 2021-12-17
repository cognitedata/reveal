import * as React from 'react';

import { getPercent } from '_helpers/getPercent';

import { WidgetContentWithLoading } from './WidgetContentWithLoading';

interface Props {
  singleData: Set<unknown>;
  singleDataLoading: boolean;
  completeData: Set<unknown>;
  completeDataLoading: boolean;
}
export const WidgetContentCalculator: React.FC<Props> = ({
  singleData,
  singleDataLoading,
  completeData,
  completeDataLoading,
}) => {
  const intersection = new Set(
    [...completeData].filter((x) => singleData.has(x))
  );

  let mainText = `${intersection.size} / ${completeData.size}`;
  let percent = `${getPercent(intersection.size, completeData.size)}%`;

  if (completeDataLoading) {
    mainText = '';
  }

  if (singleDataLoading) {
    percent = '';
    mainText = `${completeData.size} wells`;
  }

  return <WidgetContentWithLoading mainText={mainText} percent={percent} />;
};
