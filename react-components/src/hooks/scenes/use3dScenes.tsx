import { useContext } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { type Use3dScenesViewModelResult } from './use3dScenes.types';
import { Use3dScenesViewContext } from './use3dScenes.context';

export const use3dScenes = (userSdk?: CogniteClient): Use3dScenesViewModelResult => {
  const { Use3dScenesViewModel } = useContext(Use3dScenesViewContext);
  return Use3dScenesViewModel({ userSdk });
};
