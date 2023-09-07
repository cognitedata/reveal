/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX } from 'react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { LayersButton } from './LayersButton';
import { SlicerButton } from './SlicerButton';
import { SettingsButton } from './SettingsButton';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { MeasurementButton } from './MeasurementButton';
import { HelpButton } from './HelpButton';
import { type QualitySettings } from './SettingsContainer/types';
import { translations } from '../../common/i18n';

const defaultStyle: ToolBarProps = {
  style: {
    position: 'absolute',
    left: '20px',
    top: '70px'
  }
};

type RevealToolbarProps = ToolBarProps & CustomContent;

type CustomContent = {
  customSettingsContent?: JSX.Element;
  lowFidelitySettings?: Partial<QualitySettings>;
  highFidelitySettings?: Partial<QualitySettings>;
};

const DefaultContentWrapper = (props: CustomContent): ReactElement => {
  return (
    <>
      <LayersButton />
      <FitModelsButton />

      <div className="cogs-toolbar-divider" />

      <SlicerButton />
      <MeasurementButton />

      <div className="cogs-toolbar-divider" />

      <SettingsButton
        customSettingsContent={props.customSettingsContent}
        lowQualitySettings={props.lowFidelitySettings}
        highQualitySettings={props.highFidelitySettings}
      />
      <HelpButton />
    </>
  );
};

const RevealToolbarContainer = ({
  customSettingsContent,
  lowFidelitySettings,
  highFidelitySettings,
  toolBarContent,
  ...restProps
}: RevealToolbarProps & { toolBarContent?: JSX.Element }): ReactElement => {
  if (restProps.className === undefined && restProps.style === undefined) {
    restProps = { ...restProps, ...defaultStyle };
  }
  return (
    <I18nWrapper translations={translations} addNamespace="reveal-react-components">
      <ToolBar {...restProps}>
        {toolBarContent ?? (
          <DefaultContentWrapper
            customSettingsContent={customSettingsContent}
            highFidelitySettings={highFidelitySettings}
            lowFidelitySettings={lowFidelitySettings}
          />
        )}
      </ToolBar>
    </I18nWrapper>
  );
};

export const RevealToolbar = withSuppressRevealEvents(
  RevealToolbarContainer
) as typeof RevealToolbarContainer & {
  FitModelsButton: typeof FitModelsButton;
  SlicerButton: typeof SlicerButton;
  LayersButton: typeof LayersButton;
  MeasurementButton: typeof MeasurementButton;
  SettingsButton: typeof SettingsButton;
  HelpButton: typeof HelpButton;
};

RevealToolbar.FitModelsButton = FitModelsButton;
RevealToolbar.SlicerButton = SlicerButton;
RevealToolbar.LayersButton = LayersButton;
RevealToolbar.MeasurementButton = MeasurementButton;
RevealToolbar.SettingsButton = SettingsButton;
RevealToolbar.HelpButton = HelpButton;
