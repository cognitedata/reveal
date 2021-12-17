import * as React from 'react';

import { Title } from '@cognite/cogs.js';

interface LoadingProps {
  mainText: string;
  percent: string;
}
export const WidgetContentWithLoading: React.FC<LoadingProps> = ({
  mainText,
  percent,
}) => {
  const mainTextLoading = 'fetching...';
  const percentTextLoading = 'calculating...';

  const title = mainText || mainTextLoading;
  const subtitle = percent || percentTextLoading;

  const titleLevel = title && !percent ? 4 : 1;

  return (
    <>
      <Title level={titleLevel}>{title}</Title>
      <div>{subtitle}</div>
    </>
  );
};
