/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import { use3dScenes } from '../../query/use3dScenes';
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
      {Object.keys(data ?? {}).map(space => {
        if (data === undefined) return <></>;
        return Object.keys(data[space] ?? {}).map(externalId => {
          return (
            <Menu.Item
              key={`${space}-${externalId}`}
              toggled={selectedScene?.externalId === externalId && selectedScene?.space === space}
              onClick={() => {
                onSceneChange({ externalId, space });
              }}
            >
              {data[space][externalId].name}
            </Menu.Item>
          );
        });
      })}
    </>
  );
};
