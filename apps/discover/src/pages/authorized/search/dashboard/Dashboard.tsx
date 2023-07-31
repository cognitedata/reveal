import * as React from 'react';

import styled from 'styled-components/macro';

import { FlexColumn, sizes } from 'styles/layout';

import { WidgetCasings } from './widgets/WidgetCasings';
import { WidgetNDS } from './widgets/WidgetNDS';
import { WidgetNPT } from './widgets/WidgetNPT';
import { WidgetTrajectory } from './widgets/WidgetTrajectory';

export const ContentWrapper = styled(FlexColumn)`
  padding-top: ${sizes.normal};
  margin: ${sizes.small};
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: row;
  background-color: transparent;
  min-height: 100%;
`;

export const Dashboard: React.FC = () => {
  return (
    <ContentWrapper>
      <WidgetNDS />
      <WidgetNPT />
      <WidgetTrajectory />
      <WidgetCasings />
    </ContentWrapper>
  );
};
