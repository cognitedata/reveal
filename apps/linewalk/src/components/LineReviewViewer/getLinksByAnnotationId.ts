import { ParsedDocument, Link } from '../../modules/lineReviews/types';

const getLinksByAnnotationId = (
  documents: ParsedDocument[],
  annotationId: string,
  inverse = false
): Link[] => {
  const matches: Link[] = documents
    .flatMap((document) => document.linking)
    .filter((link) =>
      inverse
        ? link.to.annotationId === annotationId
        : link.from.annotationId === annotationId
    );

  if (matches.length === 0) {
    return [];
  }

  if (inverse) {
    return matches.map((match) => ({
      from: match.to,
      to: match.from,
    }));
  }

  return matches;
};

export default getLinksByAnnotationId;
