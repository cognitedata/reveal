import React from 'react';
import styled from 'styled-components';

const ConfigurationArrow = styled.div`
  padding: 48px;
  display: flex;
  justify-content: center;
  & > svg {
    width: 75%;
    stroke: var(--cogs-greyscale-grey5);
  }
`;

const ConfigArrow = () => (
  <ConfigurationArrow>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 300 31">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        d="M2 16.6337h296L283.383 2M2 16.6337h296l-14.617 11.973"
      />
    </svg>
  </ConfigurationArrow>
);

export default ConfigArrow;
