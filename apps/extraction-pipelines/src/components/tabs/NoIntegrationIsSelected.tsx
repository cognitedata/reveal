import React from 'react';
import { Detail, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import noDataSVG from 'assets/no_data.svg';

const StyledNoIntegrationIsSelected = styled.div`
  background: url(${noDataSVG}) center 5.4375rem no-repeat;
  padding: 19.5625rem 5rem 0;
  .cogs-detail {
    color: ${Colors['greyscale-grey6'].hex()};
    display: block;
    font-size: 0.75rem;
    text-align: center;
    &.strong {
      color: ${Colors['greyscale-grey10'].hex()};
      font-size: 0.8125rem;
      margin-bottom: 0.9375rem;
    }
  }
`;

const NoIntegrationIsSelected = () => {
  return (
    <StyledNoIntegrationIsSelected>
      <Detail strong>Please select an integration</Detail>
      <Detail>Helpful text, contact persons or basic monitoring.</Detail>
    </StyledNoIntegrationIsSelected>
  );
};

export default NoIntegrationIsSelected;
