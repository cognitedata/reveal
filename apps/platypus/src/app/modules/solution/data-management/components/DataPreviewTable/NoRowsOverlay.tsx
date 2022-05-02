import { Graphic } from '@cognite/cogs.js';
import React from 'react';

const NoRowsOverlay = () => {
  return (
    <span
      style={{
        padding: '10px',
        background: 'transparent',
      }}
    >
      <Graphic type="Search" /> No Data
    </span>
  );
};

export default React.memo(() => {
  return <NoRowsOverlay />;
});
