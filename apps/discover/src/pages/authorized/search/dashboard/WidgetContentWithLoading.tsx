import * as React from 'react';

import { Title } from '@cognite/cogs.js';

import { Gauge } from 'components/Gauge';

interface LoadingProps {
  mainText: string;
  percent?: number;
}
export const WidgetContentWithLoading: React.FC<LoadingProps> = ({
  mainText,
  percent,
}) => {
  const mainTextLoading = 'fetching...';
  const percentTextLoading = 'calculating...';

  const leftText = mainText || mainTextLoading;

  const titleLevel = leftText && !percent ? 4 : 2;

  return (
    <>
      <Title level={titleLevel}>{leftText}</Title>
      {percent ? <Gauge percentage={percent} /> : percentTextLoading}
    </>
  );
};
