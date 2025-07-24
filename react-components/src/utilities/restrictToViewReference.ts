import { ViewDefinition } from '@cognite/sdk';
import { Source } from '../data-providers';
import { ViewItem } from '../data-providers/FdmSDK';

export function restrictToViewReference(view: ViewItem | ViewDefinition): Source {
  return { externalId: view.externalId, space: view.space, version: view.version, type: 'view' };
}
