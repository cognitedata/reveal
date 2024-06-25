/*!
 * Copyright 2023 Cognite AS
 */

import { useMemo, type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { createCommandButton } from './CommandButton';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { ObservationsTool } from '../../architecture/concrete/observationsDomainObject/ObservationsTool';

export class RevealButtons {
  static FitView = (): ReactElement => createCommandButton(useMemo(() => new FitViewCommand(), []));

  static NavigationTool = (): ReactElement =>
    createCommandButton(useMemo(() => new NavigationTool(), []));

  static SetAxisVisible = (): ReactElement =>
    createCommandButton(useMemo(() => new SetAxisVisibleCommand(), []));

  static Measurement = (): ReactElement =>
    createCommandButton(useMemo(() => new MeasurementTool(), []));

  static Clip = (): ReactElement => createCommandButton(useMemo(() => new ClipTool(), []));

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    createCommandButton(
      useMemo(() => new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit), [])
    );

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    createCommandButton(
      useMemo(() => new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson), [])
    );

  static Observations = (): ReactElement => {
    return createCommandButton(useMemo(() => new ObservationsTool(), []));
  };
}
