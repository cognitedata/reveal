import { FormEventHandler } from 'react';

import { Button, Menu } from '@cognite/cogs.js';
import { RevealToolbar } from '@cognite/reveal-react-components';

import { useTranslation } from '../../../hooks/useTranslation';
import { StyledRevealToolBar } from '../components/ToolBar/StyledRevealToolBar';

type ToolBarContainerProps = {
  hasOriginalCadColors: boolean;
  onToggleOriginalColors: FormEventHandler<HTMLElement>;
  focusAssetCallback?: () => void;
};

export const ToolBarContainer = ({
  hasOriginalCadColors,
  onToggleOriginalColors,
  focusAssetCallback,
}: ToolBarContainerProps) => {
  return (
    <StyledRevealToolBar
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

const FocusButton = ({ onClick }: { onClick: (() => void) | undefined }) => (
  <Button
    type="ghost"
    icon="Collapse"
    aria-label="Focus asset"
    onClick={onClick}
  />
);
