import React, { ReactNode } from 'react';

import { createGlobalStyle } from 'styled-components';

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

const GlobalStyles = ({ children }: GlobalStylesProps) => {
  return (
    <div>
      <StyledGlobalStyles />
      {children}
    </div>
  );
};

export default GlobalStyles;
