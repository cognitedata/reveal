import { createContext, useContext } from 'react';

import { DataModelVersion } from '@fusion/data-modeling';

export const useContextualizationContext = () =>
  useContext(ContextualizationContext);

// moved here becasue of circular dependency
export type ContextualizationContext = {
  dataModelVersions: DataModelVersion[];
};

export const ContextualizationContext = createContext<ContextualizationContext>(
  {} as ContextualizationContext
);
