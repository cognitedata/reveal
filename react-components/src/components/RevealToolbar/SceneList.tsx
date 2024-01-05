/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import { use3dScenes } from '../../hooks/use3dScenes';
import { type DmsUniqueIdentifier } from '../../utilities/FdmSDK';

export type SceneListProps = {
  selectedScene: DmsUniqueIdentifier | undefined;
  onSceneChange: (scene?: DmsUniqueIdentifier | undefined) => void;
};

export const SceneList = ({ selectedScene, onSceneChange }: SceneListProps): ReactElement => {
  const { data } = use3dScenes();

  if (Object.keys(data ?? {}).length === 0) {
    return <></>;
  }

  return (
    <>
      {Object.keys(data ?? {}).map((sceneId) => {
        if (data === undefined) return <></>;
        const scene = data[sceneId];
        return (
          <Menu.Item
            key={sceneId}
            toggled={
              selectedScene?.externalId === scene.externalId && selectedScene?.space === scene.space
            }
            onClick={() => {
              onSceneChange(scene);
            }}>
            {scene.externalId}
          </Menu.Item>
        );
      })}
    </>
  );
};
