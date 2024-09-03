/*!
 * Copyright 2024 Cognite AS
 */
import { type DmsUniqueIdentifier } from '../FdmSDK';

export function restrictToDmsId<T extends DmsUniqueIdentifier>(identifier: T): DmsUniqueIdentifier {
  return { externalId: identifier.externalId, space: identifier.space };
}
