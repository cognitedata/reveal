import { saveAs } from 'file-saver';

import { PidDocument, PidDocumentWithDom } from '../pid';
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

import { getNoneOverlappingSymbolInstances } from './diagramInstanceUtils';
import {
  getEquipmentTagOutputFormat,
  getDiagramLineInstancesOutputFormat,
  getDiagramSymbolInstancesOutputFormat,
} from './saveGraph';

export const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Legend.json');
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

export const isValidSymbolFileSchema = (
  jsonData: any,
  svg: SVGSVGElement
): jsonData is GraphDocument => {
  const missingIds: string[] = [];

  const trackMissingId = (id: string) => {
    if (id.includes('_')) return; // comes from PathReplacements

    if (svg.getElementById(id) === null) {
      missingIds.push(id);
    }
  };

  if ('lines' in jsonData) {
    (jsonData.lines as DiagramLineInstance[]).forEach(
      (e: DiagramLineInstance) =>
        e.pathIds.forEach((pathId: string) => {
          trackMissingId(pathId);
        })
    );
  }

  if ('symbolInstances' in jsonData) {
    (jsonData.symbolInstances as DiagramSymbolInstance[]).forEach(
      (e: DiagramSymbolInstance) =>
        e.pathIds.forEach((pathId: string) => {
          trackMissingId(pathId);
        })
    );
  }

  if ('connections' in jsonData) {
    (jsonData.connections as DiagramConnection[]).forEach(
      (connection: DiagramConnection) => {
        connection.end.split('-').forEach((pathId) => {
          trackMissingId(pathId);
        });
        connection.start.split('-').forEach((pathId) => {
          trackMissingId(pathId);
        });
      }
    );
  }

  if ('equipmentTags' in jsonData) {
    (
      jsonData.equipmentTags as DiagramEquipmentTagInstanceOutputFormat[]
    ).forEach((tag: DiagramEquipmentTagInstanceOutputFormat) => {
      tag.labels.forEach((label) => {
        trackMissingId(label.id);
      });
    });
  }
  if (missingIds.length !== 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Incorrect JSON file. ID${
        missingIds.length === 0 ? '' : 's'
      } ${missingIds} was not found in SVG.`
    );
    return false;
  }
  return true;
};

export const computeSymbolInstances = (
  symbols: DiagramSymbol[],
  pidDocument: PidDocument
): DiagramSymbolInstance[] => {
  let allNewSymbolInstances: DiagramSymbolInstance[] = [];
  symbols.forEach((symbol) => {
    const newSymbolInstances = (
      pidDocument as PidDocument
    ).findAllInstancesOfSymbol(symbol);
    allNewSymbolInstances = getNoneOverlappingSymbolInstances(
      pidDocument,
      allNewSymbolInstances,
      newSymbolInstances
    );
  });
  return allNewSymbolInstances;
};

export const loadSymbolsFromJson = (
  jsonData: GraphDocument,
  setSymbols: (diagramSymbols: DiagramSymbol[]) => void,
  pidDocument: PidDocument,
  setSymbolInstances: (diagramSymbolInstances: DiagramSymbolInstance[]) => void,
  symbolInstances: DiagramSymbolInstance[],
  setLines: (diagramLines: DiagramLineInstance[]) => void,
  lines: DiagramLineInstance[],
  setConnections: (diagramConnections: DiagramConnection[]) => void,
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  setPathReplacements: (args: PathReplacement[]) => void,
  lineNumbers: string[],
  setLineNumbers: (arg: string[]) => void,
  equipmentTags: DiagramEquipmentTagInstance[],
  setEquipmentTags: (tags: DiagramEquipmentTagInstance[]) => void
) => {
  if ('symbols' in jsonData) {
    const newSymbols = jsonData.symbols as DiagramSymbol[];
    setSymbols([...newSymbols]);

    if (!('symbolInstances' in jsonData)) {
      setSymbolInstances([
        ...symbolInstances,
        ...computeSymbolInstances(newSymbols, pidDocument),
      ]);
    }
  }
  if ('lines' in jsonData) {
    setLines([...lines, ...jsonData.lines]);
  }
  if ('symbolInstances' in jsonData) {
    setSymbolInstances([...symbolInstances, ...jsonData.symbolInstances]);
  }
  if ('connections' in jsonData) {
    setConnections([...connections, ...jsonData.connections]);
  }
  if ('pathReplacements' in jsonData) {
    setPathReplacements([...pathReplacements, ...jsonData.pathReplacements]);
  }
  if ('lineNumbers' in jsonData) {
    setLineNumbers([...lineNumbers, ...jsonData.lineNumbers]);
  }
  if ('equipmentTags' in jsonData) {
    const newEquipmentTags = (
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
    setEquipmentTags([...equipmentTags, ...newEquipmentTags]);
  }
};
