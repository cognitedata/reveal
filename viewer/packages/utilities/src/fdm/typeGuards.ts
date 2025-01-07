import { DMInstanceRef } from './types';

export function isDmIdentifier(id: any): id is DMInstanceRef {
  return (id as DMInstanceRef).externalId !== undefined && (id as DMInstanceRef).space !== undefined;
}
