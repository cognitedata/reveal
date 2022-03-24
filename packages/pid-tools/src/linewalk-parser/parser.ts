import uniq from 'lodash/uniq';

import { GraphDocument, DocumentType } from '../types';
import { SymbolConnection } from '../graphMatching/types';
import getFileNameWithoutExtension from '../utils/getFileNameWithoutExtension';

import {
  connectionsToLinks,
  diagramInstanceToAnnotation,
  getExtId,
  inferIsoLineNumberToAnnotations,
  labelToAnnotation,
  mergeUnique,
  symbolTagToAnnotation,
} from './utils';
import {
  ParsedDocument,
  Annotation,
  DocumentLink,
  SymbolAnnotation,
  TextAnnotation,
  LinewalkListSchema,
  File,
  DocumentsForLineSchema,
} from './types';

const parseDocument = (
  graph: GraphDocument,
  version: string,
  allDocuments: GraphDocument[],
  connections: SymbolConnection[]
): ParsedDocument => {
  const { equipmentTags, lines, symbolInstances, labels } = graph;

  const annotations: Annotation[] = [];

  const fileNameWithoutExtension = getFileNameWithoutExtension(
    graph.documentMetadata.name
  );
  const pdfExternalId = `${fileNameWithoutExtension}.pdf`;

  const linking: DocumentLink[] = connectionsToLinks(
    connections,
    graph.documentMetadata.name,
    version
  );

  const textAnnotationMap = new Map<string, TextAnnotation>();

  const inferLineNumbersToLabels = (symbol: SymbolAnnotation) => {
    if (symbol.lineNumbers.length && symbol.labelIds.length) {
      symbol.labelIds.forEach((labelId) => {
        const textRef = textAnnotationMap.get(labelId);
        if (textRef) {
          textRef.lineNumbers = mergeUnique(
            textRef.lineNumbers,
            symbol.lineNumbers
          );
        }
      });
    }
  };

  labels?.forEach((label) => {
    const textAnnotation = labelToAnnotation(label);
    annotations.push(textAnnotation);
    textAnnotationMap.set(label.id, textAnnotation);
  });

  lines?.forEach((line) => {
    const annotation = diagramInstanceToAnnotation(line);
    annotations.push(annotation);
    inferLineNumbersToLabels(annotation);
  });

  symbolInstances?.forEach((symbol) => {
    const annotation = diagramInstanceToAnnotation(symbol);
    annotations.push(annotation);
    inferLineNumbersToLabels(annotation);
  });

  equipmentTags?.forEach((tag) => {
    const annotation = symbolTagToAnnotation(tag);
    annotations.push(annotation);
    inferLineNumbersToLabels(annotation);
  });

  if (graph.documentMetadata.type === DocumentType.isometric) {
    inferIsoLineNumberToAnnotations(
      graph.documentMetadata.lineNumber,
      annotations
    );
  }

  const filesLinkedTo = new Map<string, number>();
  linking.forEach((link) => {
    [link.from.documentId, link.to.documentId].forEach((document) => {
      const lastValue = filesLinkedTo.get(document) ?? 0;
      filesLinkedTo.set(document, lastValue + 1);
    });
  });

  // eslint-disable-next-line no-console
  console.log(
    `LINKING: Document ${graph.documentMetadata.name} links to files`,
    filesLinkedTo
  );

  return {
    annotations,
    externalId: getExtId(fileNameWithoutExtension, version),
    linking,
    pdfExternalId,
    potentialDiscrepancies: [],
    type: graph.documentMetadata.type === DocumentType.pid ? 'p&id' : 'iso',
    viewBox: graph.viewBox,
  };
};

const getParsedDocumentFiles = (
  version: string,
  parsedDocuments: ParsedDocument[]
): File[] =>
  parsedDocuments.map((parsedDocument) => ({
    fileName: parsedDocument.externalId,
    data: parsedDocument,
  }));

const getDocumentsForLineFiles = (
  version: string,
  parsedDocumentExternalIsdByLineNumber: Map<string, string[]>
): File<DocumentsForLineSchema>[] =>
  [...parsedDocumentExternalIsdByLineNumber.entries()].map(
    ([lineNumber, parsedDocumentExternalIds]) => {
      const externalId = `DOCUMENTS_FOR_LINE_V${version}_L${lineNumber}.json`;
      return {
        fileName: externalId,
        data: {
          externalId,
          line: lineNumber.toString(),
          parsedDocuments: parsedDocumentExternalIds,
        },
      };
    }
  );

const getParsedLinesFile = (version: string, lineNumbers: string[]): File => {
  const externalId = `PARSED_LINES_V${version}.json`;
  return {
    fileName: externalId,
    data: {
      externalId,
      lineIds: lineNumbers.map((number) => number.toString()),
    },
  };
};

const getLineReviewsFile = (
  version: string,
  documentsForLineFiles: File<DocumentsForLineSchema>[]
): File<LinewalkListSchema> => {
  const externalId = `LINE_REVIEWS_V${version}.json`;
  return {
    fileName: externalId,
    data: {
      externalId,
      lineReviews: documentsForLineFiles.map(
        ({ data: { externalId, line, parsedDocuments } }) => ({
          id: line,
          name: line,
          system: 'unknown',
          entryFileExternalId: externalId,
          assignees: [{ name: 'Garima' }],
          status: 'OPEN',
          discrepancies: [],
          parsedDocumentsExternalIds: parsedDocuments,
        })
      ),
    },
  };
};

export const computeLineFiles = (
  graphDocuments: GraphDocument[],
  connections: SymbolConnection[],
  version: string
): File[] => {
  const parsedDocumentsWithLineNumbers = graphDocuments.map(
    (graphDocument) => ({
      lineNumbers: graphDocument.lineNumbers ?? [],
      parsedDocument: parseDocument(
        graphDocument,
        version,
        graphDocuments,
        connections
      ),
    })
  );

  const lineNumbers: string[] = uniq(
    graphDocuments.flatMap((graphDocument) => graphDocument.lineNumbers ?? [])
  );

  const parsedDocumentExternalIdsByLineNumber = new Map<string, string[]>(
    lineNumbers.map((lineNumber) => [
      lineNumber,
      parsedDocumentsWithLineNumbers
        .filter((parsedDocumentsWithLineNumber) =>
          parsedDocumentsWithLineNumber.lineNumbers.includes(lineNumber)
        )
        .map(({ parsedDocument }) => parsedDocument.externalId),
    ])
  );

  const documentsForLineFiles = getDocumentsForLineFiles(
    version,
    parsedDocumentExternalIdsByLineNumber
  );

  return [
    ...getParsedDocumentFiles(
      version,
      parsedDocumentsWithLineNumbers.map(({ parsedDocument }) => parsedDocument)
    ),
    getParsedLinesFile(version, lineNumbers),
    ...documentsForLineFiles,
    getLineReviewsFile(version, documentsForLineFiles),
  ];
};
