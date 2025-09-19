import { type ReactNode } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import {
  Use3dScenesViewModelContext,
  defaultUse3dScenesViewModelDependencies
} from './use3dScenes.context';
import { use3dScenesViewModel } from './use3dScenes.viewmodel';
import { type Use3dScenesViewModelResult } from './use3dScenes.types';

export const use3dScenes = (userSdk?: CogniteClient): Use3dScenesViewModelResult => {
  return use3dScenesViewModel({ userSdk });
};

export const Use3dScenesProvider = ({
  children,
  dependencies = defaultUse3dScenesViewModelDependencies
}: {
  children: ReactNode;
  dependencies?: typeof defaultUse3dScenesViewModelDependencies;
}): ReactNode => (
  <Use3dScenesViewModelContext.Provider value={dependencies}>
    {children}
  </Use3dScenesViewModelContext.Provider>
);
