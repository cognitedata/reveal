import { createContext } from 'react';
import { UseSceneConfigViewModel } from './useSceneConfig.viewmodel';

export type UseSceneConfigViewDependencies = {
  UseSceneConfigViewModel: typeof UseSceneConfigViewModel;
};

export const defaultUseSceneConfigViewDependencies: UseSceneConfigViewDependencies = {
  UseSceneConfigViewModel
};

export const UseSceneConfigViewContext = createContext<UseSceneConfigViewDependencies>(
  defaultUseSceneConfigViewDependencies
);
