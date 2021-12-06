import { saveAs } from 'file-saver';
import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramLineInstance,
  DiagramConnection,
  SvgDocument,
} from '@cognite/pid-tools';

import { getDiagramInstanceOutputFormat } from './saveGraph';

export const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'DiagramSymbols.json');
};

export const saveInstancesAsJson = (
  svgDocument: SvgDocument,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[]
) => {
  const linesWithBBox = getDiagramInstanceOutputFormat(svgDocument, lines);
  const symbolInstancesWithBBox = getDiagramInstanceOutputFormat(
    svgDocument,
    symbolInstances
  );

  const jsonData = {
    symbols,
    lines: linesWithBBox,
    symbolInstances: symbolInstancesWithBBox,
    connections,
  };

  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'DiagramSymbolInstances.json');
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
  svgDocument: SvgDocument,
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
          svgDocument as SvgDocument
        ).findAllInstancesOfSymbol(newSymbol);
        allNewSymbolInstances = [
          ...allNewSymbolInstances,
          ...newSymbolInstances,
        ];
      });
      setSymbolInstances([...symbolInstances, ...allNewSymbolInstances]);
    }
  }
  if ('lines' in jsonData) {
    const newLines = jsonData.lines as DiagramLineInstance[];
    setLines([...lines, ...newLines]);
  }
  if ('symbolInstances' in jsonData) {
    const newSymboleInstance =
      jsonData.symbolInstances as DiagramSymbolInstance[];
    setSymbolInstances([...symbolInstances, ...newSymboleInstance]);
  }

  if ('connections' in jsonData) {
    const newConnections = jsonData.connections as DiagramConnection[];
    setConnections([...connections, ...newConnections]);
  }
};
