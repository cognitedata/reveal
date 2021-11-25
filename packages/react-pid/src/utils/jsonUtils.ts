import { saveAs } from 'file-saver';
import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramLineInstance,
} from '@cognite/pid-tools';

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
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[]
) => {
  const jsonData = {
    symbols,
    lines,
    symbolInstances,
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
