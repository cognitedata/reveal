import {
  DocumentType,
  GraphDocument,
  DiagramSymbolInstanceOutputFormat,
  DiagramEquipmentTagOutputFormat,
  DiagramInstanceWithPathsOutputFormat,
} from '../types';
import { isLineConnection } from '../utils';

import {
  ParsedDocument,
  ParsedDocumentsForLine,
  Annotation,
  DocumentText,
  DocumentLink,
} from './types';
import { symbolTypeMap } from './constants';
import { findIsoLink } from './links';

const diagramInstanceToAnnotation = (
  instance:
    | DiagramSymbolInstanceOutputFormat
    | DiagramInstanceWithPathsOutputFormat
): Annotation => ({
  id: 'id' in instance ? instance.id : 'none',
  type: symbolTypeMap[instance.type],
  svgPaths: instance.svgRepresentation.svgPaths,
  boundingBox: instance.svgRepresentation.boundingBox,
  nearestAssetExternalIds: [],
  labelIds: instance.labelIds,
  lineNumbers: instance.lineNumbers,
});

const symbolTagToAnnotation = (
  tag: DiagramEquipmentTagOutputFormat
): Annotation => ({
  id: tag.name,
  type: symbolTypeMap[tag.type],
  svgPaths: [],
  boundingBox: tag.boundingBox,
  nearestAssetExternalIds: [],
  labelIds: tag.labels.map((label) => label.id),
  lineNumbers: tag.lineNumbers,
});

const parseDocument = (
  graph: GraphDocument,
  version: string,
  allDocuments: GraphDocument[]
): ParsedDocument => {
  const { equipmentTags, lines, symbolInstances, labels } = graph;

  const annotations: Annotation[] = [];
  const text: { [id: string]: DocumentText } = {};
  const linking: DocumentLink[] = [];

  lines?.forEach((line) => {
    annotations.push(diagramInstanceToAnnotation(line));
  });

  symbolInstances?.forEach((symbol) => {
    if (isLineConnection(symbol)) {
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
    const { id, ...rest } = label;
    text[id] = rest;
  });

  return {
    externalId: `PARSED_DIAGRAM_V${version}_${graph.documentMetadata.name}.json`,
    pdfExternalId: graph.documentMetadata.name,
    type: graph.documentMetadata.type === DocumentType.pid ? 'p&id' : 'iso',
    potentialDiscrepancies: [],
    linking,
    annotations,
    text,
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
    const parsedDocumentsForLine: ParsedDocumentsForLine = {
      externalId: `DOCUMENTS_FOR_LINE_V${version}_L${lineNumber}.json`,
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
