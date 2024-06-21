/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { CommandButtonFromCommand } from './CommandButton';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { useFdmSdk } from '../RevealCanvas/SDKProvider';
import { ObservationsTool } from '../../architecture/concrete/observationsDomainObject/ObservationsTool';

export class RevealButtons {
  static FitView = (): ReactElement => (
    <CommandButtonFromCommand commandConstructor={() => new FitViewCommand()} />
  );

  static NavigationTool = (): ReactElement => (
    <CommandButtonFromCommand commandConstructor={() => new NavigationTool()} />
  );

  static SetAxisVisible = (): ReactElement => (
    <CommandButtonFromCommand commandConstructor={() => new SetAxisVisibleCommand()} />
  );

  static Measurement = (): ReactElement => (
    <CommandButtonFromCommand commandConstructor={() => new MeasurementTool()} />
  );

  static Clip = (): ReactElement => (
    <CommandButtonFromCommand commandConstructor={() => new ClipTool()} />
  );

  static SetFlexibleControlsTypeOrbit = (): ReactElement => (
    <CommandButtonFromCommand
      commandConstructor={() => new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit)}
    />
  );

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement => (
    <CommandButtonFromCommand
      commandConstructor={() =>
        new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson)
      }
    />
  );

  static Observations = (): ReactElement => {
    const fdmSdk = useFdmSdk();
    return <CommandButtonFromCommand commandConstructor={() => new ObservationsTool(fdmSdk)} />;
  };
}
