/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { use3dScenes } from '../../query/use3dScenes';
import { useTranslation } from '../i18n/I18n';
import { type DmsUniqueIdentifier } from '../../utilities/FdmSDK';
import { SceneList } from './SceneList';
import styled from 'styled-components';

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
          <StyledMenu>
            {orientation === 'none' && (
              <Menu.Header>{t('SCENE_SELECT_HEADER', 'Select 3D location')}</Menu.Header>
            )}
            <SceneList selectedScene={selectedScene} onSceneChange={onSceneChange} />
          </StyledMenu>
        }>
        <Button icon="World" aria-label="Select 3D location" type="ghost">
          {orientation === 'horizontal' && selectedScene?.externalId}
        </Button>
      </Dropdown>
    </CogsTooltip>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 400px;
  overflow: auto;
`;
