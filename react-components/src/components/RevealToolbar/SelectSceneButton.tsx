/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { use3dScenes } from '../../hooks/use3dScenes';
import { useTranslation } from '../i18n/I18n';
import { type DmsUniqueIdentifier } from '../../utilities/FdmSDK';
import { SceneList } from './SceneList';

export type SelectSceneButtonProps = {
  selectedScene: DmsUniqueIdentifier | undefined;
  setSelectedScene: (scene?: DmsUniqueIdentifier | undefined) => void;
};

export const SelectSceneButton = ({
  selectedScene,
  setSelectedScene: onSceneChange
}: SelectSceneButtonProps): ReactElement => {
  const { data } = use3dScenes();
  const { t } = useTranslation();

  // Don't display anything if there are no scenes
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
            <Menu.Header>t('SCENE_SELECT_HEADER', 'Select 3D location')</Menu.Header>
            <SceneList selectedScene={selectedScene} onSceneChange={onSceneChange} />
          </Menu>
        }>
        <Button icon="World" aria-label="Select 3D location" type="ghost" />
      </Dropdown>
    </CogsTooltip>
  );
};
