import keyBy from 'lodash/keyBy';

import {
  DocumentConnection,
  ParsedDocument,
} from '../../modules/lineReviews/types';

const getFileConnections = (
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
        const isSourceDocumentAvailable = sourceDocument !== undefined;
        const isTargetDocumentAvailable = targetDocument !== undefined;

        if (!isSourceDocumentAvailable) {
          console.debug(
            'Document specified by link.from.documentId was not available in workspace',
            link.from.documentId,
            documentByExternalId
          );
          return false;
        }

        if (!isTargetDocumentAvailable) {
          console.debug(
            'Document specified by link.to.documentId was not available in workspace',
            link.to.documentId,
            documentByExternalId
          );
          return false;
        }

        const sourceAnnotation = annotationsById[link.from.annotationId];
        const targetAnnotation = annotationsById[link.to.annotationId];

        // Temporarily filter out only outward links
        const shamefulIsOutwardLink = externalId === link.from.documentId;
        return (
          shamefulIsOutwardLink &&
          sourceDocument.type === sourceDocumentType &&
          targetDocument.type === targetDocumentType &&
          sourceAnnotation?.type === 'fileConnection' &&
          targetAnnotation?.type === 'fileConnection'
        );
      })
    )
    .map((link) => [link.from.annotationId, link.to.annotationId]);

  return fileConnections;
};

export default getFileConnections;
