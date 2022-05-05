import { saveAs } from 'file-saver';

import { PidDocumentWithDom } from '../pid';
import {
  DiagramConnection,
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

export const getGraphFormat = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacementGroups: PathReplacementGroup[],
  documentMetadata: DocumentMetadata,
  lineNumbers: string[],
  tags: DiagramTag[]
): GraphDocument => {
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

export const loadGraphFromJson = (
  jsonData: GraphDocument,
  setSymbols: (diagramSymbols: DiagramSymbol[]) => void,
  setSymbolInstances: (diagramSymbolInstances: DiagramSymbolInstance[]) => void,
  setLines: (diagramLines: DiagramLineInstance[]) => void,
  setConnections: (diagramConnections: DiagramConnection[]) => void,
  setPathReplacements: (args: PathReplacementGroup[]) => void,
  setLineNumbers: (arg: string[]) => void,
  setTags: (tags: DiagramTag[]) => void
) => {
  if ('pathReplacementGroups' in jsonData) {
    setPathReplacements(jsonData.pathReplacementGroups);
  }
  if ('symbols' in jsonData) {
    setSymbols(jsonData.symbols);
  }
  if ('symbolInstances' in jsonData) {
    setSymbolInstances(jsonData.symbolInstances);
  }
  if ('tags' in jsonData) {
    setTags(jsonData.tags);
  }
  if ('lines' in jsonData) {
    setLines(jsonData.lines);
  }
  if ('lineNumbers' in jsonData) {
    setLineNumbers(jsonData.lineNumbers);
  }
  if ('connections' in jsonData) {
    setConnections(jsonData.connections);
  }
};
