import { saveAs } from 'file-saver';
import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramLineInstance,
  DiagramConnection,
  PidDocument,
  getNoneOverlappingSymbolInstances,
  SVG_ID,
  BoundingBox,
  DiagramInstanceOutputFormat,
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
  viewBox: BoundingBox;
  symbols: DiagramSymbol[];
  symbolInstances: DiagramInstanceOutputFormat[];
  lines: DiagramInstanceOutputFormat[];
  connections: DiagramConnection[];
}

const getGraphFormat = (
  pidDocument: PidDocument,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[]
): Graph => {
  const linesOutputFormat = getLineInstancesOutputFormat(pidDocument, lines);
  const symbolInstancesOutputFormat = getSymbolInstancesOutputFormat(
    pidDocument,
    symbolInstances
  );

  const svgViewBox = (
    document.getElementById(SVG_ID) as unknown as SVGSVGElement
  ).viewBox;

  const viewBox = {
    x: svgViewBox.baseVal.x,
    y: svgViewBox.baseVal.y,
    width: svgViewBox.baseVal.width,
    height: svgViewBox.baseVal.height,
  };

  return {
    viewBox,
    symbols,
    lines: linesOutputFormat,
    symbolInstances: symbolInstancesOutputFormat,
    connections,
  };
};

export const saveGraphAsJson = (
  pidDocument: PidDocument,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[]
) => {
  const graphJson = getGraphFormat(
    pidDocument,
    symbols,
    lines,
    symbolInstances,
    connections
  );

  const fileToSave = new Blob([JSON.stringify(graphJson, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Graph.json');
};

export const isValidSymbolFileSchema = (jsonData: any) => {
  const missingIds: string[] = [];

  if ('lines' in jsonData) {
    (jsonData.lines as DiagramLineInstance[]).forEach(
      (e: DiagramLineInstance) =>
        e.pathIds.forEach((id: string) => {
          if (document.getElementById(id) === null) {
            missingIds.push(id);
          }
        })
    );
  }

  if ('symbolInstances' in jsonData) {
    (jsonData.symbolInstances as DiagramSymbolInstance[]).forEach(
      (e: DiagramSymbolInstance) =>
        e.pathIds.forEach((id: string) => {
          if (document.getElementById(id) === null) {
            missingIds.push(id);
          }
        })
    );
  }

  if ('connections' in jsonData) {
    (jsonData.connections as DiagramConnection[]).forEach(
      (connection: DiagramConnection) => {
        connection.end.split('-').forEach((pathId) => {
          if (document.getElementById(pathId) === null) {
            missingIds.push(pathId);
          }
        });
        connection.start.split('-').forEach((pathId) => {
          if (document.getElementById(pathId) === null) {
            missingIds.push(pathId);
          }
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
  connections: DiagramConnection[]
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
};
