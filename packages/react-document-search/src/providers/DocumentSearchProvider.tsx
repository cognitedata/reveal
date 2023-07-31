import React, { createContext, useMemo, useState } from 'react';
import { CogniteClient, DocumentSearchRequest } from '@cognite/sdk';
import noop from 'lodash/noop';

interface DocumentSearchContextData {
  appliedFilters: Omit<DocumentSearchRequest, 'limit'>;
  setAppliedFilters: (filters: DocumentSearchRequest) => void;
}
export const DocumentSearchContext = createContext<
  Partial<Props> & DocumentSearchContextData
>({
  appliedFilters: {},
  setAppliedFilters: () => noop,
});

export interface Props {
  sdkClient: CogniteClient;
  // Commented out the options, might be useful in the future.
  // options?: {
  //   limit?: number;
  // };
}

export const DocumentSearchProvider: React.FC<
  React.PropsWithChildren<Props>
> = ({ children, sdkClient }) => {
  const [appliedFilters, setAppliedFilters] = useState<DocumentSearchRequest>({
    search: {
      query: '',
    },
  });

  const value = useMemo(() => {
    return {
      sdkClient,
      // options,
      appliedFilters,
      setAppliedFilters,
    };
  }, [sdkClient, appliedFilters, setAppliedFilters]);
  return (
    <DocumentSearchContext.Provider value={value}>
      {children}
    </DocumentSearchContext.Provider>
  );
};
