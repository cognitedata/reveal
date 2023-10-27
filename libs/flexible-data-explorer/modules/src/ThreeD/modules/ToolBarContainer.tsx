import { FormEventHandler } from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Button, Menu, Tooltip } from '@cognite/cogs.js';
import {
  withCameraStateUrlParam,
  RevealToolbar,
} from '@cognite/reveal-react-components';

import { StyledRevealToolBar } from '../components/ToolBar/StyledRevealToolBar';

type ToolBarContainerProps = {
  hasOriginalCadColors: boolean;
  onToggleOriginalColors: FormEventHandler<HTMLElement>;
  focusAssetCallback?: () => void;
};

const ThreeDToolbar = withCameraStateUrlParam(StyledRevealToolBar);

export const ToolBarContainer = ({
  hasOriginalCadColors,
  onToggleOriginalColors,
  focusAssetCallback,
}: ToolBarContainerProps) => {
  return (
    <ThreeDToolbar
      toolBarContent={
        <ToolBarContent
          hasOriginalCadColors={hasOriginalCadColors}
          onToggleOriginalColors={onToggleOriginalColors}
          focusAssetCallback={focusAssetCallback}
        />
      }
    />
  );
};

const ToolBarContent = ({
  hasOriginalCadColors,
  onToggleOriginalColors,
  focusAssetCallback,
}: ToolBarContainerProps) => {
  const { t } = useTranslation();

  return (
    <>
      <RevealToolbar.LayersButton />
      <RevealToolbar.FitModelsButton />
      <FocusButton onClick={focusAssetCallback} />

      <div className="cogs-toolbar-divider" />

      <RevealToolbar.SlicerButton />
      <RevealToolbar.MeasurementButton />

      <div className="cogs-toolbar-divider" />

      <RevealToolbar.SettingsButton
        customSettingsContent={
          <>
            <Menu.Item
              hasSwitch
              toggled={hasOriginalCadColors}
              onChange={onToggleOriginalColors}
            >
              {t('3D_TOOLBAR_CAD_COLOR_TOGGLE')}
            </Menu.Item>
          </>
        }
      />
      <RevealToolbar.HelpButton />
    </>
  );
};

const FocusButton = ({ onClick }: { onClick: (() => void) | undefined }) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      content={t('3D_TOOLBAR_FOCUS_SELECTED_EQUIPMENT')}
      placement="right"
      appendTo={document.body}
    >
      <Button
        type="ghost"
        icon="Collapse"
        aria-label="Focus asset"
        onClick={onClick}
      />
    </Tooltip>
  );
};
