import React from 'react';

import '@cognite/cogs.js/dist/cogs.css';

export const StoryWrapper = ({ children }) => {
  return <div style={{ flex: '1' }}>{children}</div>;
};
