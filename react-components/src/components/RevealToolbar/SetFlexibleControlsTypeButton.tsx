/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback, useEffect, useState } from 'react';

import { Button, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  type CameraManager,
  FlexibleControlsType,
  type IFlexibleCameraManager
} from '@cognite/reveal';

import { useTranslation } from '../i18n/I18n';

export function SetFlexibleControlsOrbitButton(): ReactElement {
  return SetFlexibleControlsTypeButton(FlexibleControlsType.Orbit);
}

export function SetFlexibleControlsOrbitInCenterButton(): ReactElement {
  return SetFlexibleControlsTypeButton(FlexibleControlsType.OrbitInCenter);
}

export function SetFlexibleControlsFirstPersonButton(): ReactElement {
  return SetFlexibleControlsTypeButton(FlexibleControlsType.FirstPerson);
}

function SetFlexibleControlsTypeButton(controlsType: FlexibleControlsType): ReactElement {
  const viewer = useReveal();
  const manager = asFlexibleCameraManager(viewer.cameraManager);
  const { t: translate } = useTranslation();

  // This value is redunant (react force me to do it)
  const [selectedValue, setSelectedValue] = useState<FlexibleControlsType>(
    getDefaultValue(manager)
  );
  const update = (newControlsType: FlexibleControlsType): void => {
    setSelectedValue(newControlsType);
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

  const onClick = useCallback((): void => {
    if (manager !== undefined) {
      manager.controlsType = controlsType;
    }
  }, [manager]);

  if (manager === undefined) {
    return <></>;
  }

  function getTooltip(controlsType: FlexibleControlsType): string {
    switch (controlsType) {
      case FlexibleControlsType.FirstPerson:
        return translate('MODE_FIRST_PERSON_MODE_TOOLTIP', 'Set Camera to First Person mode');
      case FlexibleControlsType.Orbit:
        return translate('MODE_ORBIT_MODE_TOOLTIP', 'Set Camera to Orbit mode');
      case FlexibleControlsType.OrbitInCenter:
        return translate('MODE_ORBIT_IN_CENTER_TOOLTIP', 'Set Camera to Orbit in Center mode');
      default:
        return 'Undefined';
    }
  }

  function getLabel(controlsType: FlexibleControlsType): string {
    switch (controlsType) {
      case FlexibleControlsType.FirstPerson:
        return translate('MODEL_FIRST_PERSON_LABEL', 'First Person');
      case FlexibleControlsType.Orbit:
        return translate('MODE_ORBIT_LABEL', 'Orbit');
      case FlexibleControlsType.OrbitInCenter:
        return translate('MODE_ORBIT_IN_CENTER_LABEL', 'Center Orbit');
      default:
        return 'Undefined';
    }
  }
  return (
    <CogsTooltip content={getTooltip(controlsType)} placement="right" appendTo={document.body}>
      <Button
        type="ghost"
        icon={getIcon(controlsType)}
        toggled={selectedValue === controlsType}
        aria-label={getLabel(controlsType)}
        onClick={onClick}
      />
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
