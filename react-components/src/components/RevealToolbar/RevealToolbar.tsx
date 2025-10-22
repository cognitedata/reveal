import { type ReactElement, type JSX, forwardRef, type Ref, ForwardRefExoticComponent, RefAttributes } from 'react';
import { Divider, ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { SlicerButton } from './SlicerButton/SlicerButton';
import { SettingsButton } from './SettingsButton/SettingsButton';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { HelpButton } from './HelpButton/HelpButton';
import { ShareButton } from './ShareButton';
import { ResetCameraButton } from './ResetCameraButton';
import { type QualitySettings } from '../../architecture/base/utilities/quality/QualitySettings';
import styled from 'styled-components';
import { SelectSceneButton } from './SelectSceneButton';
import { RuleBasedOutputsButton } from './RuleBasedOutputsButton/RuleBasedOutputsButton';
import { AssetContextualizedButton } from './AssetContextualizedButton';
import { LayersButton } from './LayersButton/LayersButton';

const StyledToolBar = styled(ToolBar)`
  position: absolute !important;
  left: 20px;
  top: 70px;
  width: 48px;
  padding: 6px;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid rgba(83, 88, 127, 0.24);
`;

export type RevealToolbarProps = ToolBarProps & CustomToolbarContent;

export type CustomToolbarContent = {
  customSettingsContent?: JSX.Element;
  lowFidelitySettings?: Partial<QualitySettings>;
  highFidelitySettings?: Partial<QualitySettings>;
  storeStateInUrl?: boolean;
};

const DefaultContentWrapper = (props: CustomToolbarContent): ReactElement => {
  return (
    <>
      <LayersButton />
      <FitModelsButton />
      <RuleBasedOutputsButton />
      <Divider weight="2px" length="75%" />

      <SlicerButton />

      <Divider weight="2px" length="75%" />

      <ShareButton />

      <Divider weight="2px" length="75%" />

      <SettingsButton
        customSettingsContent={props.customSettingsContent}
        lowQualitySettings={props.lowFidelitySettings}
        highQualitySettings={props.highFidelitySettings}
      />
      <HelpButton />
    </>
  );
};

const RevealToolbarContainer: ForwardRefExoticComponent<Omit<ToolBarProps & CustomToolbarContent & {
    toolBarContent?: JSX.Element;
}, "ref"> & RefAttributes<HTMLDivElement>> = forwardRef(
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
  ShareButton: typeof ShareButton;
  SettingsButton: typeof SettingsButton;
  HelpButton: typeof HelpButton;
  ResetCameraButton: typeof ResetCameraButton;
  SelectSceneButton: typeof SelectSceneButton;
  RuleBasedOutputsButton: typeof RuleBasedOutputsButton;
  AssetContextualizedButton: typeof AssetContextualizedButton;
};

RevealToolbar.FitModelsButton = FitModelsButton;
RevealToolbar.SlicerButton = SlicerButton;
RevealToolbar.LayersButton = LayersButton;
RevealToolbar.ShareButton = ShareButton;
RevealToolbar.SettingsButton = SettingsButton;
RevealToolbar.HelpButton = HelpButton;
RevealToolbar.ResetCameraButton = ResetCameraButton;
RevealToolbar.SelectSceneButton = SelectSceneButton;
RevealToolbar.RuleBasedOutputsButton = RuleBasedOutputsButton;
RevealToolbar.AssetContextualizedButton = AssetContextualizedButton;
