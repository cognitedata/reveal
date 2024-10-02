/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { ObservationsTool } from './ObservationsTool';

export abstract class ObservationsCommand extends RenderTargetCommand {
  protected getTool(): ObservationsTool | undefined {
    return this.getActiveTool(ObservationsTool);
  }

  protected getObservationsDomainObject(): ObservationsDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ObservationsDomainObject);
  }
}
