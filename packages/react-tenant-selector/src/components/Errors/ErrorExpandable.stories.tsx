import React from 'react';

import ErrorExpandable from './ErrorExpandable';

export default {
  title: 'Errors/ErrorExpandable',
};

export const Base = () => {
  return (
    <ErrorExpandable title="There has been an error">
      <div>Something is taking longer than usual. Please refresh the page.</div>
      <div>
        Contact <a href="mailto:support@cognite.com">support@cognite.com</a> if
        the problem persists.
      </div>
    </ErrorExpandable>
  );
};
