import React, { FunctionComponent } from 'react';
import { CenterFullVH } from 'styles/StyledWrapper';
import { A, Colors, Detail, Graphic, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { LEARNING_AND_RESOURCES_URL } from '../../pages/Integrations/Integrations';

const NoIntegrationsWrapper = styled((props) => (
  <CenterFullVH {...props}>{props.children}</CenterFullVH>
))`
  display: flex;
  flex-direction: column;
  align-items: center;
  h2 {
    color: ${Colors['greyscale-grey10'].hex()};
    font-size: 0.8125rem;
    margin: 2.4375rem 0 0.9375rem;
  }
  .cogs-detail {
    color: ${Colors['greyscale-grey6'].hex()};
    font-size: 0.75rem;
  }
`;
interface OwnProps {}

type Props = OwnProps;

const NoIntegrations: FunctionComponent<Props> = () => {
  return (
    <NoIntegrationsWrapper>
      <Graphic type="RuleMonitoring" style={{ width: '100%' }} />
      <Title level={2}>You have no integrations</Title>
      <Detail>
        Go here to{' '}
        <A href={LEARNING_AND_RESOURCES_URL}>learn how to set up integration</A>
      </Detail>
    </NoIntegrationsWrapper>
  );
};

export default NoIntegrations;
