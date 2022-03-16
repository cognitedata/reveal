import { saveAs } from 'file-saver';

import { PidDocument } from '../pid';
import { DiagramSymbol, DiagramSymbolInstance, Legend } from '../types';

import { getNoneOverlappingSymbolInstances } from './diagramInstanceUtils';

export const isValidLegendJson = (
  jsonData: Record<keyof Legend, unknown>
): jsonData is Legend => {
  return 'symbols' in jsonData;
};

export const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData: Legend = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Legend.json');
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

export const loadLegendFromJson = (
  jsonData: Legend,
  symbols: DiagramSymbol[],
  setSymbols: (diagramSymbols: DiagramSymbol[]) => void,
  symbolInstances: DiagramSymbolInstance[],
  setSymbolInstances: (diagramSymbolInstances: DiagramSymbolInstance[]) => void,
  pidDocument: PidDocument
) => {
  const newSymbols = jsonData.symbols as DiagramSymbol[];
  setSymbols([...symbols, ...newSymbols]);

  setSymbolInstances([
    ...symbolInstances,
    ...computeSymbolInstances(newSymbols, pidDocument),
  ]);
};
