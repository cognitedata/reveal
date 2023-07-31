import { saveAs } from 'file-saver';

import { PidDocumentWithDom } from '../pid';
import {
  DiagramConnection,
  DiagramInstanceWithPaths,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramTag,
  DocumentMetadata,
  GraphDocument,
  PathReplacementGroup,
} from '../types';

import getFileNameWithoutExtension from './getFileNameWithoutExtension';
import {
  getTagOutputFormat,
  getDiagramLineInstancesOutputFormat,
  getDiagramSymbolInstancesOutputFormat,
} from './saveGraph';

export const isValidGraphDocumentJson = (
  jsonData: Record<keyof GraphDocument, unknown>
): jsonData is GraphDocument => {
  const requiredFields = ['symbolInstances'];

  return !requiredFields.some((field) => !(field in jsonData));
};

export const getGraphFormat = ({
  pidDocument,
  symbols,
  lines,
  symbolInstances,
  connections,
  pathReplacementGroups,
  documentMetadata,
  lineNumbers,
  tags,
  manuallyRemovedLines,
  manuallyRemovedConnections,
  manuallyRemovedLabelConnections,
}: {
  pidDocument: PidDocumentWithDom;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  connections: DiagramConnection[];
  pathReplacementGroups: PathReplacementGroup[];
  documentMetadata: DocumentMetadata;
  lineNumbers: string[];
  tags: DiagramTag[];
  manuallyRemovedLines: DiagramLineInstance[];
  manuallyRemovedConnections: DiagramConnection[];
  manuallyRemovedLabelConnections: [DiagramInstanceWithPaths, string][];
}): GraphDocument => {
  const linesOutputFormat = getDiagramLineInstancesOutputFormat(
    pidDocument,
    lines
  );
  const symbolInstancesOutputFormat = getDiagramSymbolInstancesOutputFormat(
    pidDocument,
    symbolInstances
  );
  const tagsOutputFormat = getTagOutputFormat(pidDocument, tags);

  const labels = pidDocument.pidLabels.map((label) => {
    return label.toDiagramLabelOutputFormat();
  });

  return {
    documentMetadata,
    viewBox: pidDocument.viewBox,
    symbols,
    lines: linesOutputFormat,
    symbolInstances: symbolInstancesOutputFormat,
    connections,
    pathReplacementGroups,
    lineNumbers,
    tags: tagsOutputFormat,
    labels,
    manuallyRemovedLines,
    manuallyRemovedConnections,
    manuallyRemovedLabelConnections,
  };
};

export const saveGraphAsJson = (graph: GraphDocument) => {
  const fileName = graph.documentMetadata.name
    ? `${getFileNameWithoutExtension(graph.documentMetadata.name)}.json`
    : 'graph.json';
  const fileToSave = new Blob([JSON.stringify(graph, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, fileName);
};
