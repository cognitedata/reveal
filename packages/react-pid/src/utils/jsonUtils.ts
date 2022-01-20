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
} from '@cognite/pid-tools';

import {
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
}

const getGraphFormat = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentType: DocumentType,
  lineNumbers: string[]
): Graph => {
  const linesOutputFormat = getLineInstancesOutputFormat(pidDocument, lines);
  const symbolInstancesOutputFormat = getSymbolInstancesOutputFormat(
    pidDocument,
    symbolInstances
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
  lineNumbers: string[]
) => {
  const graphJson = getGraphFormat(
    pidDocument,
    symbols,
    lines,
    symbolInstances,
    connections,
    pathReplacements,
    documentType,
    lineNumbers
  );

  const fileToSave = new Blob([JSON.stringify(graphJson, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Graph.json');
};

export const isValidSymbolFileSchema = (jsonData: any, svg: SVGSVGElement) => {
  const missingIds: string[] = [];

  const trackMissingPathIds = (pathId: string) => {
    if (pathId.includes('_')) return; // comes from PathReplacements

    if (svg.getElementById(pathId) === null) {
      missingIds.push(pathId);
    }
  };

  if ('lines' in jsonData) {
    (jsonData.lines as DiagramLineInstance[]).forEach(
      (e: DiagramLineInstance) =>
        e.pathIds.forEach((pathId: string) => {
          trackMissingPathIds(pathId);
        })
    );
  }

  if ('symbolInstances' in jsonData) {
    (jsonData.symbolInstances as DiagramSymbolInstance[]).forEach(
      (e: DiagramSymbolInstance) =>
        e.pathIds.forEach((pathId: string) => {
          trackMissingPathIds(pathId);
        })
    );
  }

  if ('connections' in jsonData) {
    (jsonData.connections as DiagramConnection[]).forEach(
      (connection: DiagramConnection) => {
        connection.end.split('-').forEach((pathId) => {
          trackMissingPathIds(pathId);
        });
        connection.start.split('-').forEach((pathId) => {
          trackMissingPathIds(pathId);
        });
      }
    );
  }

  if (missingIds.length !== 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Incorrect JSON file. Path ID${
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
  setLineNumbers: (arg: string[]) => void
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
};
