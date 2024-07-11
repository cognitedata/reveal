/*!
 * Copyright 2024 Cognite AS
 */
import {
  is360ImageDataModelAddOptions,
  is360ImageEventsAddOptions
} from '../components/Reveal3DResources/typeGuards';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';

export function createAddOptionsKey(model: TaggedAddResourceOptions): string {
  if (model.type === 'cad' || model.type === 'pointcloud') {
    return `${model.type}-${model.addOptions.modelId}-${model.addOptions.revisionId}`;
  } else if (model.type === 'image360' && is360ImageDataModelAddOptions(model.addOptions)) {
    return `${model.type}-${model.addOptions.externalId}/${model.addOptions.space}`;
  } else if (model.type === 'image360' && is360ImageEventsAddOptions(model.addOptions)) {
    return `${model.type}-${model.addOptions.siteId}`;
  } else {
    throw Error('Unrecognized add option type');
  }
}
