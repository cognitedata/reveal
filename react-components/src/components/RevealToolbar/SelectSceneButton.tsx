/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, useState, type ReactElement } from 'react';

import { Button, Menu, Tooltip as CogsTooltip, WorldIcon } from '@cognite/cogs.js';
import { use3dScenes } from '../../hooks/scenes/use3dScenes';
import { useTranslation } from '../i18n/I18n';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { SceneList, type SceneWithName } from './SceneList';
import styled from 'styled-components';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';

export type SelectSceneButtonProps = {
  selectedScene: DmsUniqueIdentifier | undefined;
  setSelectedScene: (scene?: DmsUniqueIdentifier | undefined) => void;
  orientation?: 'horizontal' | 'none';
};

export const SelectSceneButton = ({
  selectedScene,
  setSelectedScene: onSceneChange,
  orientation = 'none'
}: SelectSceneButtonProps): ReactElement => {
  const { data } = use3dScenes();
  const { t } = useTranslation();

  const [sceneName, setSceneName] = useState<string | undefined>();

  const setSceneAndUpdateName = useCallback(
    (scene: SceneWithName | undefined) => {
      onSceneChange(scene);
      setSceneName(scene?.name);
    },
    [setSceneName]
  );

  // Don't display anything if there are no scenes
  if (Object.keys(data ?? {}).length === 0) {
    return <></>;
  }

  return (
    <StyledMenu
      placement="right-start"
      appendTo={document.body}
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      renderTrigger={(props: any) => (
        <CogsTooltip content={t({ key: 'SCENE_SELECT_HEADER' })}>
          <Button icon=<WorldIcon /> aria-label="Select 3D location" type="ghost" {...props}>
            {orientation === 'horizontal' && sceneName}
          </Button>
        </CogsTooltip>
      )}>
      {orientation === 'none' && <Menu.Header>{t({ key: 'SCENE_SELECT_HEADER' })}</Menu.Header>}
      <SceneList selectedScene={selectedScene} onSceneChange={setSceneAndUpdateName} />
    </StyledMenu>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 400px;
  overflow: auto;
`;
