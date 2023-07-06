/*!
 * Copyright 2023 Cognite AS
 */
import { createContext } from 'react';

export type ModelsLoadingState = {
  modelsAdded: boolean;
  setModelsAdded: (value: boolean) => void;
};
export const ModelsLoadingStateContext = createContext<ModelsLoadingState>({
  modelsAdded: false,
  setModelsAdded: () => {}
});
