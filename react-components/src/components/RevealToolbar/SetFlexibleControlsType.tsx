/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useEffect, useState } from 'react';

import { SegmentedControl, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  type CameraManager,
  FlexibleControlsType,
  type IFlexibleCameraManager
} from '@cognite/reveal';

import { useTranslation } from '../i18n/I18n';

type CustomSettingsProps = {
  includeOrbitInCenter?: boolean;
};

export function SetOrbitOrFirstPersonControlsType(): ReactElement {
  return SetFlexibleControlsType({ includeOrbitInCenter: false });
}

export function SetFlexibleControlsType({
  includeOrbitInCenter
}: CustomSettingsProps): ReactElement {
  const viewer = useReveal();
  const manager = asFlexibleCameraManager(viewer.cameraManager);
  const { t: translate } = useTranslation();

  // This value is redunant (react force me to do it)
  const [selectedControlsType, setSelectedControlsType] = useState<FlexibleControlsType>(
    getDefaultValue(manager)
  );
  const update = (newControlsType: FlexibleControlsType): void => {
    setSelectedControlsType(newControlsType);
  };

  useEffect(() => {
    if (manager === undefined) {
      return;
    }
    manager.addControlsTypeChangeListener(update);
    return () => {
      if (manager !== undefined) {
        manager.removeControlsTypeChangeListener(update);
      }
    };
  }, []); // Should only be called once

  if (manager === undefined) {
    return <></>;
  }

  function getLabel(controlsType: FlexibleControlsType): string {
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

  const options = [FlexibleControlsType.Orbit, FlexibleControlsType.FirstPerson];
  if (includeOrbitInCenter ?? false) {
    options.push(FlexibleControlsType.OrbitInCenter);
  }

  return (
    <CogsTooltip
      content={translate('CONTROLS_TYPE_TOOLTIP', 'Set Camera to Orbit or Fly mode')}
      placement="right"
      appendTo={document.body}>
      <SegmentedControl
        onButtonClicked={(controlsType: FlexibleControlsType) => {
          if (manager !== undefined) {
            manager.controlsType = controlsType;
          }
          setSelectedControlsType(controlsType);
        }}
        currentKey={selectedControlsType}
        fullWidth>
        {options.map((controlsType) => (
          <SegmentedControl.Button key={controlsType} icon={getIcon(controlsType)}>
            {getLabel(controlsType)}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    </CogsTooltip>
  );
}

function getDefaultValue(manager: IFlexibleCameraManager | undefined): FlexibleControlsType {
  return manager !== undefined ? manager.controlsType : FlexibleControlsType.Orbit;
}

function getIcon(controlsType: FlexibleControlsType): IconType {
  switch (controlsType) {
    case FlexibleControlsType.FirstPerson:
      return 'Plane';
    case FlexibleControlsType.Orbit:
      return 'Circle';
    case FlexibleControlsType.OrbitInCenter:
      return 'Coordinates';
    default:
      return 'Error';
  }
}

function asFlexibleCameraManager(manager: CameraManager): IFlexibleCameraManager | undefined {
  // instanceof don't work within React, so using safeguarding
  const flexibleCameraManager = manager as IFlexibleCameraManager;
  return flexibleCameraManager.controlsType === undefined ? undefined : flexibleCameraManager;
}
