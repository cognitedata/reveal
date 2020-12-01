import React from 'react';

import '@cognite/cogs.js/dist/cogs.css';
import '@cognite/node-visualizer/node-visualizer.css';

export const StoryWrapper = ({ children }) => {
  return <div style={{ flex: '1' }}>{children}</div>;
};
