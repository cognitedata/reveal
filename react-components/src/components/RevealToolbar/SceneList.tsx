/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs-lab';
import { use3dScenes } from '../../hooks/scenes/use3dScenes';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';

export type SceneWithName = DmsUniqueIdentifier & { name: string };

export type SceneListProps = {
  selectedScene: DmsUniqueIdentifier | undefined;
  onSceneChange: (scene: SceneWithName | undefined) => void;
};

export const SceneList = ({ selectedScene, onSceneChange }: SceneListProps): ReactElement => {
  const { data } = use3dScenes();

  if (Object.keys(data ?? {}).length === 0) {
    return <></>;
  }

  return (
    <>
      {Object.keys(data ?? {}).map((space) => {
        if (data === undefined) return <></>;
        return Object.keys(data[space] ?? {}).map((externalId) => {
          const name = data[space][externalId].name;
          return (
            <Menu.ItemToggled
              key={`${space}-${externalId}`}
              toggled={selectedScene?.externalId === externalId && selectedScene?.space === space}
              onClick={() => {
                onSceneChange({ externalId, space, name });
              }}>
              {data[space][externalId].name}
            </Menu.ItemToggled>
          );
        });
      })}
    </>
  );
};
