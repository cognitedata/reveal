import React from 'react';
import { Graphic, Detail, A, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const StyledNoIntegrationIsSelected = styled.div`
  height: calc(100vh - 10.5rem);
  overflow-y: auto;
  padding: 6rem 5rem 0;
  .cogs-detail {
    color: ${Colors['greyscale-grey6'].hex()};
    display: block;
    font-size: 0.75rem;
    margin-bottom: 0.9375rem;
    text-align: center;
    &.strong {
      color: ${Colors['greyscale-grey10'].hex()};
      font-size: 0.8125rem;
      margin: 2.4375rem 0 0.9375rem;
    }
  }
`;

const NoIntegrationIsSelected = () => {
  return (
    <StyledNoIntegrationIsSelected>
      <Graphic type="RuleMonitoring" style={{ width: '100%' }} />
      <Detail strong>Please select an integration</Detail>
      <Detail>
        In the sidepanel you will see basic monitoring and and contact
        information to persons connected to the integration.
      </Detail>
      <Detail>
        You can also{' '}
        <A href="#search-integrations">search for an integration</A> by entering
        name, destination data set or contact person.
      </Detail>
    </StyledNoIntegrationIsSelected>
  );
};

export default NoIntegrationIsSelected;
