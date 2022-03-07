import keyBy from 'lodash/keyBy';

import {
  AnnotationType,
  DocumentConnection,
  ParsedDocument,
} from '../../modules/lineReviews/types';

const getFileConnections = (
  line: string,
  documents: ParsedDocument[],
  sourceDocumentType: string,
  targetDocumentType: string
) => {
  const annotationsById = keyBy(
    documents.flatMap((document) => document.annotations),
    (annotation) => annotation.id
  );

  const documentByExternalId = keyBy(
    documents,
    (document) => document.externalId
  );

  const fileConnections: DocumentConnection[] = documents
    .flatMap(({ externalId, linking }) =>
      linking.filter((link) => {
        const sourceDocument = documentByExternalId[link.from.documentId];
        const targetDocument = documentByExternalId[link.to.documentId];
        const sourceAnnotation = annotationsById[link.from.annotationId];
        const targetAnnotation = annotationsById[link.to.annotationId];

        // Temporarily filter out only outward links
        const shamefulIsOutwardLink = externalId === link.from.documentId;

        return (
          shamefulIsOutwardLink &&
          sourceDocument.type === sourceDocumentType &&
          targetDocument.type === targetDocumentType &&
          sourceAnnotation?.type === AnnotationType.FILE_CONNECTION &&
          targetAnnotation?.type === AnnotationType.FILE_CONNECTION &&
          sourceAnnotation?.lineNumbers.includes(line) &&
          targetAnnotation?.lineNumbers.includes(line)
        );
      })
    )
    .map((link) => [link.from.annotationId, link.to.annotationId]);

  return fileConnections;
};

export default getFileConnections;
