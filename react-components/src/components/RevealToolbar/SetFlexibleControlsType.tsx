/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useEffect, useState, useCallback } from 'react';

import { SegmentedControl, Tooltip as CogsTooltip, Button } from '@cognite/cogs.js';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  FlexibleControlsType,
  type IFlexibleCameraManager,
  type CameraManager
} from '@cognite/reveal';

import { useTranslation } from '../i18n/I18n';
import styled from 'styled-components';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { getIconComponent, IconName } from '../Architecture/getIconComponent';
import { assertNever } from '../../utilities/assertNever';

type CustomSettingsProps = {
  includeOrbitInCenter?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

type ControlTypeSelectionProps = {
  selectedControlsType: FlexibleControlsType;
  setSelectedControlsType: (controlsType: FlexibleControlsType) => void;
  options: FlexibleControlsType[];
  translateDelegate: TranslateDelegate;
};

export function SetOrbitOrFirstPersonControlsType(
  props: Omit<CustomSettingsProps, 'includeOrbitInCenter'>
): ReactElement {
  return SetFlexibleControlsType({ ...props, includeOrbitInCenter: false });
}

export function SetFlexibleControlsType({
  includeOrbitInCenter,
  orientation
}: CustomSettingsProps): ReactElement {
  const viewer = useReveal();
  const flexibleCameraManager = asFlexibleCameraManager(viewer.cameraManager);
  const { t: translate } = useTranslation();

  // This value is redunant (react force me to do it)
  const [selectedControlsType, setSelectedControlsType] = useState<FlexibleControlsType>(
    getDefaultValue(flexibleCameraManager)
  );

  const setSelectedControlsTypeAndUpdateCameraManager = useCallback(
    (controlsType: FlexibleControlsType) => {
      setSelectedControlsType(controlsType);
      if (flexibleCameraManager !== undefined) {
        flexibleCameraManager.controlsType = controlsType;
      }
    },
    [flexibleCameraManager]
  );

  useListenToCameraManagerUpdate(flexibleCameraManager, setSelectedControlsType);

  if (flexibleCameraManager === undefined) {
    return <></>;
  }

  const options = [FlexibleControlsType.Orbit, FlexibleControlsType.FirstPerson];

  if (includeOrbitInCenter ?? false) {
    options.push(FlexibleControlsType.OrbitInCenter);
  }

  const controlsTypeParameters: ControlTypeSelectionProps = {
    selectedControlsType,
    setSelectedControlsType: setSelectedControlsTypeAndUpdateCameraManager,
    options,
    translateDelegate: translate
  };

  return (orientation ?? 'vertical') === 'horizontal' ? (
    <SegmentedControlTypeSelector {...controlsTypeParameters} />
  ) : (
    <ButtonsControlTypeSelector {...controlsTypeParameters} />
  );
}

const useListenToCameraManagerUpdate = (
  cameraManager: IFlexibleCameraManager | undefined,
  setSelectedControlsType: (controlsType: FlexibleControlsType) => void
): void => {
  useEffect(() => {
    if (cameraManager === undefined) {
      return;
    }

    const update = (newControlsType: FlexibleControlsType): void => {
      setSelectedControlsType(newControlsType);
    };

    cameraManager.addControlsTypeChangeListener(update);
    return () => {
      if (cameraManager !== undefined) {
        cameraManager.removeControlsTypeChangeListener(update);
      }
    };
  }, []); // Should only be called once
};

const ButtonsControlTypeSelector = ({
  options,
  selectedControlsType,
  setSelectedControlsType,
  translateDelegate
}: ControlTypeSelectionProps): ReactElement => {
  return (
    <ButtonsContainer>
      {options.map((controlType) => {
        const IconComponent = getIconComponent(getIcon(controlType));
        return (
          <CogsTooltip
            content={getLabel(translateDelegate, controlType)}
            placement="right"
            appendTo={document.body}
            key={controlType}>
            <Button
              type="ghost"
              icon=<IconComponent />
              toggled={selectedControlsType === controlType}
              aria-label={getLabel(translateDelegate, controlType)}
              onClick={() => {
                setSelectedControlsType(controlType);
              }}></Button>
          </CogsTooltip>
        );
      })}
    </ButtonsContainer>
  );
};

const SegmentedControlTypeSelector = ({
  options,
  selectedControlsType,
  setSelectedControlsType,
  translateDelegate
}: ControlTypeSelectionProps): ReactElement => (
  <CogsTooltip
    content={translateDelegate('CONTROLS_TYPE_TOOLTIP', 'Set Camera to Orbit or Fly mode')}
    placement="right"
    appendTo={document.body}>
    <SegmentedControl
      onButtonClicked={(controlsType: FlexibleControlsType) => {
        setSelectedControlsType(controlsType);
      }}
      currentKey={selectedControlsType}
      fullWidth>
      {options.map((controlsType) => {
        const iconName = getIcon(controlsType);
        const IconComponent = getIconComponent(iconName);
        return (
          <SegmentedControl.Button key={controlsType} icon={<IconComponent />}>
            {getLabel(translateDelegate, controlsType)}
          </SegmentedControl.Button>
        );
      })}
    </SegmentedControl>
  </CogsTooltip>
);

function getLabel(translate: TranslateDelegate, controlsType: FlexibleControlsType): string {
  switch (controlsType) {
    case FlexibleControlsType.FirstPerson:
      return translate('CONTROLS_TYPE_FIRST_PERSON', 'Fly');
    case FlexibleControlsType.Orbit:
      return translate('CONTROLS_TYPE_ORBIT', 'Orbit');
    case FlexibleControlsType.OrbitInCenter:
      return translate('CONTROLS_TYPE_ORBIT_IN_CENTER', 'Center Orbit');
    default:
      return 'Undefined';
  }
}

function getDefaultValue(manager: IFlexibleCameraManager | undefined): FlexibleControlsType {
  return manager !== undefined ? manager.controlsType : FlexibleControlsType.Orbit;
}

function getIcon(controlsType: FlexibleControlsType): IconName {
  switch (controlsType) {
    case FlexibleControlsType.FirstPerson:
      return 'Plane';
    case FlexibleControlsType.Orbit:
      return 'Circle';
    case FlexibleControlsType.OrbitInCenter:
      return 'Coordinates';
    default:
      assertNever(controlsType);
  }
}

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export function asFlexibleCameraManager(
  manager: CameraManager
): IFlexibleCameraManager | undefined {
  // instanceof don't work within React, so using safeguarding
  const flexibleCameraManager = manager as IFlexibleCameraManager;
  return flexibleCameraManager.controlsType === undefined ? undefined : flexibleCameraManager;
}
