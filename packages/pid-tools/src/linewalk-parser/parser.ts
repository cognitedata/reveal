import { GraphDocument, DocumentType } from '../types';
import { isFileConnection, isLineConnection } from '../utils';
import { SymbolConnection } from '../graphMatching/types';

import {
  connectionsToLinks,
  diagramInstanceToAnnotation,
  getExtId,
  getFileNameWithoutExtension,
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
  ParsedDocumentsForLine,
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

const uploadToCDF = async (
  document: ParsedDocument | ParsedDocumentsForLine
) => {
  fetch(`cdf/somDir/${document.externalId}`, {
    method: 'PUT',
    body: JSON.stringify(document),
  });
};

export const computeLines = async (
  documents: GraphDocument[],
  connections: SymbolConnection[],
  version: string,
  storeDocumentCallback:
    | undefined
    | ((document: ParsedDocument | ParsedDocumentsForLine) => void) = undefined
) => {
  const lineNumbers: number[] = [];
  const graphsPerLine = new Map<number, string[]>();

  documents.forEach((graph) => {
    const document = parseDocument(graph, version, documents, connections);
    if (storeDocumentCallback) {
      storeDocumentCallback(document);
    } else {
      uploadToCDF(document);
    }

    graph.lineNumbers?.forEach((number) => {
      if (!lineNumbers.includes(number)) {
        lineNumbers.push(number);
      }
      const prevGraphs = graphsPerLine.get(number) || [];
      graphsPerLine.set(number, [...prevGraphs, document.externalId]);
    });
  });

  lineNumbers.forEach((lineNumber) => {
    const parsedDocumentsForLine = {
      externalId: `DOCUMENTS_FOR_LINE_V${version}_L${lineNumber}.json`,
      line: lineNumber.toString(),
      parsedDocuments: graphsPerLine.get(lineNumber) || [],
    };

    if (storeDocumentCallback) {
      storeDocumentCallback(parsedDocumentsForLine);
    } else {
      uploadToCDF(parsedDocumentsForLine);
    }
  });
};
