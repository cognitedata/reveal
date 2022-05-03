import { GraphDocument, DiagramType } from '../types';
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
  File,
} from './types';

const parseDocument = (
  graph: GraphDocument,
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
    graph.documentMetadata.name
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

  if (graph.documentMetadata.type === DiagramType.isometric) {
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
    externalId: getExtId(fileNameWithoutExtension),
    linking,
    pdfExternalId,
    potentialDiscrepancies: [],
    type: graph.documentMetadata.type === DiagramType.pid ? 'p&id' : 'iso',
    viewBox: graph.viewBox,
    lineNumbers: graph.lineNumbers,
    unit: graph.documentMetadata.unit,
  };
};

const getParsedDocumentFiles = (
  parsedDocuments: ParsedDocument[]
): File<ParsedDocument>[] =>
  parsedDocuments.map((parsedDocument) => ({
    fileName: parsedDocument.externalId,
    data: parsedDocument,
  }));

export const computeLineFiles = (
  graphDocuments: GraphDocument[],
  connections: SymbolConnection[]
): File<ParsedDocument>[] => {
  const parsedDocumentsWithLineNumbers = graphDocuments.map(
    (graphDocument) => ({
      lineNumbers: graphDocument.lineNumbers ?? [],
      parsedDocument: parseDocument(graphDocument, graphDocuments, connections),
    })
  );

  return getParsedDocumentFiles(
    parsedDocumentsWithLineNumbers.map(({ parsedDocument }) => parsedDocument)
  );
};
