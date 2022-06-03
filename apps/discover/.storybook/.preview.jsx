import React from 'react';

import GlobalStyles from 'styles/globalStyles';

export const decorators = [
  (Story) => (
    <>
      <GlobalStyles />
      <Story />
    </>
  ),
];
