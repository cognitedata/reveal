/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type DmsUniqueIdentifier, use3dScenes } from '../..';
import { useTranslation } from '../i18n/I18n';

export type SelectSceneButtonProps = {
  selectedScene: DmsUniqueIdentifier | undefined;
  setSelectedScene: (scene?: DmsUniqueIdentifier | undefined) => void;
};

export const SelectSceneButton = ({
  selectedScene,
  setSelectedScene
}: SelectSceneButtonProps): ReactElement => {
  const { data } = use3dScenes();
  const { t } = useTranslation();

  if (Object.keys(data ?? {}).length === 0) {
    return <></>;
  }

  return (
    <CogsTooltip
      content={t('SCENE_SELECT_HEADER', 'Select 3D location')}
      placement="right"
      appendTo={document.body}>
      <Dropdown
        placement="right-start"
        content={
          <Menu>
            <Menu.Header>Select 3D location</Menu.Header>
            {Object.keys(data ?? {}).map((sceneId) => {
              if (data === undefined) return <></>;
              const scene = data[sceneId];
              return (
                <Menu.Item
                  key={sceneId}
                  toggled={
                    selectedScene?.externalId === scene.externalId &&
                    selectedScene?.space === scene.space
                  }
                  onClick={() => {
                    setSelectedScene(scene);
                  }}>
                  {scene.externalId}
                </Menu.Item>
              );
            })}
          </Menu>
        }>
        <Button icon="World" type="ghost" />
      </Dropdown>
    </CogsTooltip>
  );
};
