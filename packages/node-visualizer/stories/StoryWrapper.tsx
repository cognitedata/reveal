import React from 'react';

import '@cognite/cogs.js/dist/cogs.css';

export const StoryWrapper = ({ children }: { children: JSX.Element }) => {
  return <div style={{ flex: '1' }}>{children}</div>;
};
