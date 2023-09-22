/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX, forwardRef, type Ref } from 'react';
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
import styled from 'styled-components';

const StyledToolBar = styled(ToolBar)`
  position: absolute;
  left: 20px;
  top: 70px;
  width: 48px;
  padding: 6px;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid rgba(83, 88, 127, 0.24);
`;

type RevealToolbarProps = ToolBarProps & CustomContent;

type CustomContent = {
  customSettingsContent?: JSX.Element;
  lowFidelitySettings?: Partial<QualitySettings>;
  highFidelitySettings?: Partial<QualitySettings>;
  storeStateInUrl?: boolean;
};

const DefaultContentWrapper = (props: CustomContent): ReactElement => {
  return (
    <>
      <LayersButton />
      <FitModelsButton />

      <div className="cogs-toolbar-divider" />

      <SlicerButton storeStateInUrl={props.storeStateInUrl}/>
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

const RevealToolbarContainer = forwardRef(
  (
    {
      customSettingsContent,
      lowFidelitySettings,
      highFidelitySettings,
      toolBarContent,
      storeStateInUrl,
      ...restProps
    }: RevealToolbarProps & { toolBarContent?: JSX.Element },
    ref: Ref<HTMLDivElement>
  ): ReactElement => {
    return (
      <I18nWrapper translations={translations} addNamespace="reveal-react-components">
        <StyledToolBar {...restProps} ref={ref}>
          {toolBarContent ?? (
            <DefaultContentWrapper
              customSettingsContent={customSettingsContent}
              highFidelitySettings={highFidelitySettings}
              lowFidelitySettings={lowFidelitySettings}
              storeStateInUrl={storeStateInUrl}
            />
          )}
        </StyledToolBar>
      </I18nWrapper>
    );
  }
);

RevealToolbarContainer.displayName = 'RevealToolbarContainer';

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
