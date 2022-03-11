import uniq from 'lodash/uniq';

import { GraphDocument, DocumentType } from '../types';
import {
  getFileNameWithoutExtension,
  isFileConnection,
  isLineConnection,
} from '../utils';
import { SymbolConnection } from '../graphMatching/types';

import {
  connectionsToLinks,
  diagramInstanceToAnnotation,
  getExtId,
  inferIsoLineNumberToAnnotations,
  labelToAnnotation,
  mergeUnique,
  symbolTagToAnnotation,
} from './utils';
import { findPidLink, findIsoLink } from './links';
import {
  ParsedDocument,
  Annotation,
  DocumentLink,
  SymbolAnnotation,
  TextAnnotation,
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
    pdfExternalId,
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
    if (isFileConnection(symbol)) {
      const link = findPidLink(symbol, graph, allDocuments, version);
      if (link !== undefined) {
        linking.push(link);
      }
    } else if (isLineConnection(symbol)) {
      const link = findIsoLink(symbol, graph, allDocuments, version);
      if (link !== undefined) {
        linking.push(link);
      }
    }
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

type File = {
  fileName: string;
  data: any;
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
): File[] =>
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

export const computeLines = (
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

  return [
    ...getParsedDocumentFiles(
      version,
      parsedDocumentsWithLineNumbers.map(({ parsedDocument }) => parsedDocument)
    ),
    ...getDocumentsForLineFiles(version, parsedDocumentExternalIdsByLineNumber),
    getParsedLinesFile(version, lineNumbers),
  ];
};
