import {
  DocumentType,
  GraphDocument,
  DiagramSymbolInstanceOutputFormat,
  DiagramEquipmentTagInstanceOutputFormat,
  DiagramLabelOutputFormat,
  DiagramLineInstanceOutputFormat,
} from '../types';
import { isFileConnection, isLineConnection } from '../utils/type';

import {
  ParsedDocument,
  ParsedDocumentsForLine,
  Annotation,
  SymbolAnnotation,
  TextAnnotation,
  DocumentLink,
} from './types';
import { symbolTypeMap } from './constants';
import { findPidLink, findIsoLink } from './links';

const diagramInstanceToAnnotation = (
  instance: DiagramSymbolInstanceOutputFormat | DiagramLineInstanceOutputFormat
): SymbolAnnotation => ({
  id: instance.id,
  type: symbolTypeMap[instance.type],
  svgPaths: instance.svgRepresentation.svgPaths,
  boundingBox: instance.svgRepresentation.boundingBox,
  nearestAssetExternalIds: [],
  labelIds: instance.labelIds,
  lineNumbers: instance.lineNumbers,
});

const symbolTagToAnnotation = (
  tag: DiagramEquipmentTagInstanceOutputFormat
): SymbolAnnotation => ({
  id: tag.id,
  type: symbolTypeMap[tag.type],
  svgPaths: [],
  boundingBox: tag.svgRepresentation.boundingBox,
  nearestAssetExternalIds: [],
  labelIds: tag.labels.map((label) => label.id),
  lineNumbers: tag.lineNumbers,
});

const labelToAnnotation = (
  label: DiagramLabelOutputFormat
): TextAnnotation => ({
  id: label.id,
  type: 'text',
  text: label.text,
  svgPaths: [],
  boundingBox: label.boundingBox,
  nearestAssetExternalIds: [],
  lineNumbers: [],
});

const parseDocument = (
  graph: GraphDocument,
  version: string,
  allDocuments: GraphDocument[]
): ParsedDocument => {
  const { equipmentTags, lines, symbolInstances, labels } = graph;

  const annotations: Annotation[] = [];

  const fileNameWithoutExtension = graph.documentMetadata.name.replace(
    '.svg',
    ''
  );
  const pdfName = `${fileNameWithoutExtension}.pdf`;
  const linking: DocumentLink[] = [];

  lines?.forEach((line) => {
    annotations.push(diagramInstanceToAnnotation(line));
  });

  symbolInstances?.forEach((symbol) => {
    if (isFileConnection(symbol)) {
      const link = findPidLink(symbol, graph, allDocuments);
      if (link !== undefined) {
        linking.push(link);
      }
    } else if (isLineConnection(symbol)) {
      const link = findIsoLink(symbol, graph, allDocuments);
      if (link !== undefined) {
        linking.push(link);
      }
    }
    annotations.push(diagramInstanceToAnnotation(symbol));
  });

  equipmentTags?.forEach((tag) => {
    annotations.push(symbolTagToAnnotation(tag));
  });

  labels?.forEach((label) => {
    annotations.push(labelToAnnotation(label));
  });

  return {
    annotations,
    externalId: `PARSED_DIAGRAM_V${version}_${fileNameWithoutExtension}.json`,
    linking,
    pdfExternalId: pdfName,
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
  version: string,
  storeDocumentCallback:
    | undefined
    | ((document: ParsedDocument | ParsedDocumentsForLine) => void) = undefined
) => {
  const lineNumbers: string[] = [];
  const graphsPerLine = new Map<string, string[]>();

  documents.forEach((graph) => {
    const document = parseDocument(graph, version, documents);
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
      externalId: `DOCUMENTS_FOR_LINE_V${version}_${lineNumber}.json`,
      line: lineNumber,
      parsedDocuments: graphsPerLine.get(lineNumber) || [],
    };

    if (storeDocumentCallback) {
      storeDocumentCallback(parsedDocumentsForLine);
    } else {
      uploadToCDF(parsedDocumentsForLine);
    }
  });
};
