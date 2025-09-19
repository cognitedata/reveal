import { createContext } from 'react';
import { Use3dScenesViewModel } from './use3dScenes.viewmodel';

export type Use3dScenesViewDependencies = {
  Use3dScenesViewModel: typeof Use3dScenesViewModel;
};

export const defaultUse3dScenesViewDependencies: Use3dScenesViewDependencies = {
  Use3dScenesViewModel
};

export const Use3dScenesViewContext = createContext<Use3dScenesViewDependencies>(
  defaultUse3dScenesViewDependencies
);
