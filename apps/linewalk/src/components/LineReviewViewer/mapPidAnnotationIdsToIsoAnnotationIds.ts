import type { ParsedDocument } from '../../modules/lineReviews/types';
import isNotUndefined from '../../utils/isNotUndefined';

import getLinkByAnnotationId from './getLinkByAnnotationId';

const mapPidAnnotationIdsToIsoAnnotationIds = (
  documents: ParsedDocument[],
  ids: string[]
) =>
  ids
    .map((id) => getLinkByAnnotationId(documents, id))
    .filter(isNotUndefined)
    .map((link) => link.to.annotationId);

export default mapPidAnnotationIdsToIsoAnnotationIds;
