import * as React from 'react';

import styled from 'styled-components/macro';

import { Title } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

const PercentageContainer = styled.div`
  margin: ${sizes.normal};
`;
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

  const leftText = mainText || mainTextLoading;
  const rightText = percent || percentTextLoading;

  const titleLevel = leftText && !percent ? 4 : 2;

  return (
    <>
      <Title level={titleLevel}>{leftText}</Title>
      <PercentageContainer>{rightText}</PercentageContainer>
    </>
  );
};
