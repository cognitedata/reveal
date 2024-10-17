/*!
 * Copyright 2024 Cognite AS
 */
import { RenderTargetCommand } from '../../base/commands/RenderTargetCommand';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { ObservationsTool } from './ObservationsTool';

export abstract class ObservationCommand<ObservationIdType> extends RenderTargetCommand {
  protected getTool(): ObservationsTool<ObservationIdType> | undefined {
    return this.getActiveTool(ObservationsTool);
  }

  protected getObservationsDomainObject(): ObservationsDomainObject<ObservationIdType> | undefined {
    return this.rootDomainObject.getDescendantByType(ObservationsDomainObject);
  }
}
