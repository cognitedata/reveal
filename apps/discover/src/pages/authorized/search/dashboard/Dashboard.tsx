import React from 'react';

import styled from 'styled-components/macro';

import { FlexColumn, sizes } from 'styles/layout';

import { WidgetNDS } from './WidgetNDS';

export const ContentWrapper = styled(FlexColumn)`
  padding-top: ${sizes.normal};
  margin: ${sizes.small};
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: transparent;
  min-height: 100%;
`;

export const Dashboard: React.FC = () => {
  return (
    <ContentWrapper>
      <WidgetNDS />
    </ContentWrapper>
  );
};
