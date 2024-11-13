/*!
 * Copyright 2024 Cognite AS
 */
import {
  is360ImageDataModelAddOptions,
  is360ImageEventsAddOptions,
  isClassicIdentifier,
  isDMIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';

export function createAddOptionsKey(model: TaggedAddResourceOptions): string {
  if (model.type === 'cad') {
    return `${model.type}-${model.addOptions.modelId}-${model.addOptions.revisionId}`;
  } else if (model.type === 'pointcloud' && isClassicIdentifier(model.addOptions)) {
    return `${model.type}-${model.addOptions.modelId}-${model.addOptions.revisionId}`;
  } else if (model.type === 'pointcloud' && isDMIdentifier(model.addOptions)) {
    return `${model.type}-${model.addOptions.revisionExternalId}-${model.addOptions.revisionSpace}`;
  } else if (model.type === 'image360' && is360ImageDataModelAddOptions(model.addOptions)) {
    return `${model.type}-${model.addOptions.externalId}/${model.addOptions.space}`;
  } else if (model.type === 'image360' && is360ImageEventsAddOptions(model.addOptions)) {
    return `${model.type}-${model.addOptions.siteId}`;
  } else {
    throw Error('Unrecognized add option type');
  }
}
