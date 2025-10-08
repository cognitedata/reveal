import { type ViewDefinition } from '@cognite/sdk';
import { type Source } from '../data-providers';
import { type ViewItem } from '../data-providers/FdmSDK';

export function restrictToViewReference(view: ViewItem | ViewDefinition): Source {
  return { externalId: view.externalId, space: view.space, version: view.version, type: 'view' };
}
