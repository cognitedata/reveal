import { ParsedDocument, Link } from '../../modules/lineReviews/types';

const getLinkByAnnotationId = (
  documents: ParsedDocument[],
  annotationId: string,
  inverse = false
): Link | undefined => {
  const match: Link | undefined = documents
    .flatMap((document) => document.linking)
    .find((link) =>
      inverse
        ? link.to.annotationId === annotationId
        : link.from.annotationId === annotationId
    );

  if (match === undefined) {
    return undefined;
  }

  if (inverse) {
    return {
      from: match.to,
      to: match.from,
    };
  }

  return inverse ? { from: match.to, to: match.from } : match;
};

export default getLinkByAnnotationId;
