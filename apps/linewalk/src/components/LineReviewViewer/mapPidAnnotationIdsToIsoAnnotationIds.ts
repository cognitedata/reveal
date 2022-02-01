import type { Document } from '../../modules/lineReviews/types';
import isNotUndefined from '../../utils/isNotUndefined';

import getIsoLinkByPidAnnotationId from './getIsoLinkByPidAnnotationId';

const mapPidAnnotationIdsToIsoAnnotationIds = (
  documents: Document[],
  ids: string[]
) =>
  ids
    .map((id) => getIsoLinkByPidAnnotationId(documents, id))
    .filter(isNotUndefined)
    .map((link) => link.to.instanceId);

export default mapPidAnnotationIdsToIsoAnnotationIds;
