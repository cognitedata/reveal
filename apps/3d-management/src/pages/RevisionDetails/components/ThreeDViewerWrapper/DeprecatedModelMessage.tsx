import React from 'react';

export const DeprecatedModelMessage = () => {
  return (
    <div style={{ fontSize: 'var(--cogs-t5-font-size)' }}>
      <p>This model uses deprecated format that is not supported anymore.</p>
      <p>
        Please request reprocessing of that model from your project
        administrator.
      </p>
    </div>
  );
};
