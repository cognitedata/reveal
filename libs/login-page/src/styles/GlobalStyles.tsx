import React, { ReactNode } from 'react';

import { createGlobalStyle } from 'styled-components';

import { Tooltip as CogsTooltip } from '@cognite/cogs.js';

import { getContainer } from '../utils';

import { styleScope } from './styleScope';

type GlobalStylesProps = {
  children: ReactNode;
};

const StyledGlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }
`;

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

const GlobalStyles = ({ children }: GlobalStylesProps) => {
  return (
    <div className={styleScope}>
      <StyledGlobalStyles />
      {children}
    </div>
  );
};

export default GlobalStyles;
