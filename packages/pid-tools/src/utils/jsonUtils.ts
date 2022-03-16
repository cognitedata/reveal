import { saveAs } from 'file-saver';

import { PidDocumentWithDom } from '../pid';
import {
  DiagramConnection,
  DiagramEquipmentTagInstance,
  DiagramEquipmentTagInstanceOutputFormat,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentMetadata,
  GraphDocument,
  PathReplacement,
} from '../types';

import {
  getEquipmentTagOutputFormat,
  getDiagramLineInstancesOutputFormat,
  getDiagramSymbolInstancesOutputFormat,
} from './saveGraph';

export const isValidGraphDocumentJson = (
  jsonData: Record<keyof GraphDocument, unknown>
): jsonData is GraphDocument => {
  const requiredFields = ['symbolInstances'];

  return !requiredFields.some((field) => !(field in jsonData));
};

const getGraphFormat = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentMetadata: DocumentMetadata,
  lineNumbers: string[],
  equipmentTags: DiagramEquipmentTagInstance[]
): GraphDocument => {
  const linesOutputFormat = getDiagramLineInstancesOutputFormat(
    pidDocument,
    lines
  );
  const symbolInstancesOutputFormat = getDiagramSymbolInstancesOutputFormat(
    pidDocument,
    symbolInstances
  );
  const equipmentTagInstancesFormat = getEquipmentTagOutputFormat(
    pidDocument,
    equipmentTags
  );

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
    pathReplacements,
    lineNumbers,
    equipmentTags: equipmentTagInstancesFormat,
    labels,
  };
};

export const saveGraphAsJson = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentMetadata: DocumentMetadata,
  lineNumbers: string[],
  equipmentTags: DiagramEquipmentTagInstance[],
  fileName = 'Graph.json'
) => {
  const graphJson = getGraphFormat(
    pidDocument,
    symbols,
    lines,
    symbolInstances,
    connections,
    pathReplacements,
    documentMetadata,
    lineNumbers,
    equipmentTags
  );

  const fileToSave = new Blob([JSON.stringify(graphJson, undefined, 2)], {
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
  setPathReplacements: (args: PathReplacement[]) => void,
  setLineNumbers: (arg: string[]) => void,
  setEquipmentTags: (tags: DiagramEquipmentTagInstance[]) => void
) => {
  if ('pathReplacements' in jsonData) {
    setPathReplacements(jsonData.pathReplacements);
  }
  if ('symbols' in jsonData) {
    const newSymbols = jsonData.symbols as DiagramSymbol[];
    setSymbols([...newSymbols]);
  }
  if ('symbolInstances' in jsonData) {
    setSymbolInstances(jsonData.symbolInstances);
  }
  if ('equipmentTags' in jsonData) {
    const equipmentTags = (
      jsonData.equipmentTags as DiagramEquipmentTagInstanceOutputFormat[]
    ).map((tag) =>
      tag.labels.reduce<DiagramEquipmentTagInstance>(
        (prev, curr) => ({
          ...prev,
          labelIds: [...prev.labelIds, curr.id],
        }),
        {
          id: tag.id,
          equipmentTag: tag.equipmentTag,
          labelIds: [],
          type: 'EquipmentTag',
          lineNumbers: tag.lineNumbers,
          inferedLineNumbers: tag.inferedLineNumbers,
        }
      )
    );
    setEquipmentTags(equipmentTags);
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
