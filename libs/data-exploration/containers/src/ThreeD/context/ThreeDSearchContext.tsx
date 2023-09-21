import { useState } from 'react';

import {
  DEFAULT_SEARCH_RESULTS_PAGE_SIZE_3D,
  ThreeDSearchContext,
} from '@data-exploration-lib/core';

export const ThreeDSearchContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pageLimit, setPageLimit] = useState(
    DEFAULT_SEARCH_RESULTS_PAGE_SIZE_3D
  );
  const [resultIndex, setResultIndex] = useState(pageLimit - 1);
  return (
    <ThreeDSearchContext.Provider
      value={{ resultIndex, setResultIndex, pageLimit, setPageLimit }}
    >
      {children}
    </ThreeDSearchContext.Provider>
  );
};
