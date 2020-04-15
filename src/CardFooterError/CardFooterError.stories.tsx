import React from 'react';

import CardFooterError from './CardFooterError';

export default {
  title: 'Errors|CardFooterError',
};

export const Base = () => {
  return (
    <CardFooterError>
      <div>Something is taking longer than usual. Please refresh the page.</div>
      <div>
        Contact <a href="mailto:support@cognite.com">support@cognite.com</a> if
        the problem persists.
      </div>
    </CardFooterError>
  );
};
