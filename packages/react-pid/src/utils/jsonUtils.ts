import { saveAs } from 'file-saver';
import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramLineInstance,
  DiagramConnection,
  PidDocument,
  getNoneOverlappingSymbolInstances,
  BoundingBox,
  DiagramInstanceOutputFormat,
  PathReplacement,
  DocumentType,
  PidDocumentWithDom,
  DiagramEquipmentTagInstance,
  DiagramEquipmentTagOutputFormat,
} from '@cognite/pid-tools';

import {
  getEquipmentTagOutputFormat,
  getLineInstancesOutputFormat,
  getSymbolInstancesOutputFormat,
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

interface Graph {
  documentType: DocumentType;
  viewBox: BoundingBox;
  symbols: DiagramSymbol[];
  symbolInstances: DiagramInstanceOutputFormat[];
  lines: DiagramInstanceOutputFormat[];
  connections: DiagramConnection[];
  pathReplacements: PathReplacement[];
  lineNumbers: string[];
  equipmentTags: DiagramEquipmentTagOutputFormat[];
}

const getGraphFormat = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentType: DocumentType,
  lineNumbers: string[],
  equipmentTags: DiagramEquipmentTagInstance[]
): Graph => {
  const linesOutputFormat = getLineInstancesOutputFormat(pidDocument, lines);
  const symbolInstancesOutputFormat = getSymbolInstancesOutputFormat(
    pidDocument,
    symbolInstances
  );
  const equipmentTagInstancesFormat = getEquipmentTagOutputFormat(
    pidDocument,
    equipmentTags
  );

  const svgViewBox = pidDocument.svg.viewBox;

  const viewBox = {
    x: svgViewBox.baseVal.x,
    y: svgViewBox.baseVal.y,
    width: svgViewBox.baseVal.width,
    height: svgViewBox.baseVal.height,
  };

  return {
    documentType,
    viewBox,
    symbols,
    lines: linesOutputFormat,
    symbolInstances: symbolInstancesOutputFormat,
    connections,
    pathReplacements,
    lineNumbers,
    equipmentTags: equipmentTagInstancesFormat,
  };
};

export const saveGraphAsJson = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentType: DocumentType,
  lineNumbers: string[],
  equipmentTags: DiagramEquipmentTagInstance[]
) => {
  const graphJson = getGraphFormat(
    pidDocument,
    symbols,
    lines,
    symbolInstances,
    connections,
    pathReplacements,
    documentType,
    lineNumbers,
    equipmentTags
  );

  const fileToSave = new Blob([JSON.stringify(graphJson, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Graph.json');
};

export const isValidSymbolFileSchema = (jsonData: any, svg: SVGSVGElement) => {
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
    (jsonData.equipmentTags as DiagramEquipmentTagOutputFormat[]).forEach(
      (tag: DiagramEquipmentTagOutputFormat) => {
        tag.labels.forEach((label) => {
          trackMissingId(label.id);
        });
      }
    );
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

export const loadSymbolsFromJson = (
  jsonData: any,
  setSymbols: (diagramSymbols: DiagramSymbol[]) => void,
  symbols: DiagramSymbol[],
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
    setSymbols([...symbols, ...newSymbols]);

    if (!('symbolInstances' in jsonData)) {
      let allNewSymbolInstances: DiagramSymbolInstance[] = [];
      newSymbols.forEach((newSymbol) => {
        const newSymbolInstances = (
          pidDocument as PidDocument
        ).findAllInstancesOfSymbol(newSymbol);
        allNewSymbolInstances = getNoneOverlappingSymbolInstances(
          pidDocument,
          allNewSymbolInstances,
          newSymbolInstances
        );
      });
      setSymbolInstances([...symbolInstances, ...allNewSymbolInstances]);
    }
  }
  if ('lines' in jsonData) {
    const newLinesOutputFormat =
      jsonData.lines as DiagramInstanceOutputFormat[];

    const newLines = newLinesOutputFormat.map((newLineOutputFormat) => {
      return {
        type: 'Line',
        pathIds: newLineOutputFormat.pathIds,
        labelIds: newLineOutputFormat.labelIds,
        lineNumbers: newLineOutputFormat.lineNumbers,
      } as DiagramLineInstance;
    });
    setLines([...lines, ...newLines]);
  }
  if ('symbolInstances' in jsonData) {
    const newSymbolInstancesOutputFormat =
      jsonData.symbolInstances as DiagramInstanceOutputFormat[];

    const newSymbolInstances: DiagramSymbolInstance[] = [];
    newSymbolInstancesOutputFormat.forEach((symbolInstanceOutputFormat) => {
      newSymbolInstances.push({
        type: symbolInstanceOutputFormat.type,
        symbolId: symbolInstanceOutputFormat.symbolId,
        pathIds: symbolInstanceOutputFormat.pathIds,
        labelIds: symbolInstanceOutputFormat.labelIds,
      } as DiagramSymbolInstance);
    });
    setSymbolInstances([...symbolInstances, ...newSymbolInstances]);
  }
  if ('connections' in jsonData) {
    const newConnections = jsonData.connections as DiagramConnection[];
    setConnections([...connections, ...newConnections]);
  }
  if ('pathReplacements' in jsonData) {
    const newPathReplacements = jsonData.pathReplacements as PathReplacement[];
    setPathReplacements([...pathReplacements, ...newPathReplacements]);
  }
  if ('lineNumbers' in jsonData) {
    setLineNumbers([...lineNumbers, ...jsonData.lineNumbers]);
  }

  if ('equipmentTags' in jsonData) {
    const newEquipmentTags = (
      jsonData.equipmentTags as DiagramEquipmentTagOutputFormat[]
    ).map((tag) =>
      tag.labels.reduce<DiagramEquipmentTagInstance>(
        (prev, curr) => ({
          ...prev,
          description:
            curr.text === tag.name
              ? prev.description
              : [...prev.description, curr.text],
          labelIds: [...prev.labelIds, curr.id],
        }),
        {
          name: tag.name,
          description: [],
          labelIds: [],
          type: 'EquipmentTag',
          lineNumbers: tag.lineNumbers,
        }
      )
    );
    setEquipmentTags([...equipmentTags, ...newEquipmentTags]);
  }
};
