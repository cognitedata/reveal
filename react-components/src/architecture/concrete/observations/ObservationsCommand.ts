/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { ObservationsTool } from './ObservationsTool';

export abstract class ObservationsCommand extends RenderTargetCommand {
  protected getTool(): ObservationsTool | undefined {
    if (this.activeTool instanceof ObservationsTool) {
      return this.activeTool;
    }

    return undefined;
  }

  protected getObservationsDomainObject(): ObservationsDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ObservationsDomainObject);
  }
}
