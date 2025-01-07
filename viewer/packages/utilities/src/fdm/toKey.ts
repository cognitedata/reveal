import { DMExternalId, DMInstanceRef, DMSpace } from './types';

export type DMInstanceKey = `${DMSpace}/${DMExternalId}`;

export function dmInstanceRefToKey(id: DMInstanceRef): DMInstanceKey {
  return `${id.space}/${id.externalId}`;
}
