import React, { createContext, useMemo, useState } from 'react';
import { CogniteClient, DocumentSearchRequest } from '@cognite/sdk';
import noop from 'lodash/noop';

interface DocumentSearchContextData {
  appliedFilters: DocumentSearchRequest;
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
  options?: {
    limit?: number;
  };
}

export const DocumentSearchProvider: React.FC<
  React.PropsWithChildren<Props>
> = ({ children, sdkClient, options }) => {
  const [appliedFilters, setAppliedFilters] = useState<DocumentSearchRequest>({
    search: {
      query: '',
    },
  });

  const value = useMemo(() => {
    return {
      sdkClient,
      options,
      appliedFilters,
      setAppliedFilters,
    };
  }, [sdkClient, options, appliedFilters, setAppliedFilters]);
  return (
    <DocumentSearchContext.Provider value={value}>
      {children}
    </DocumentSearchContext.Provider>
  );
};
