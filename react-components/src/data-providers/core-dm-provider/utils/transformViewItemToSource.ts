import type { Source, ViewItem } from '../../FdmSDK';

export function transformViewItemToSource(view: ViewItem): Source {
  return {
    type: 'view',
    externalId: view.externalId,
    space: view.space,
    version: view.version
  };
}
