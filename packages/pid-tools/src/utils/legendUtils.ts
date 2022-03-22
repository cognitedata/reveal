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
  existingSymbolInstances: DiagramSymbolInstance[],
  pidDocument: PidDocument
) => {
  let symbolInstancesToKeep: DiagramSymbolInstance[] = [
    ...existingSymbolInstances,
  ];
  symbols.forEach((symbol) => {
    const newSymbolInstances = pidDocument.findAllInstancesOfSymbol(symbol);
    symbolInstancesToKeep = getNoneOverlappingSymbolInstances(
      pidDocument,
      symbolInstancesToKeep,
      newSymbolInstances
    ).instancesToKeep;
  });

  const symbolInstancesIds = new Set(
    symbolInstancesToKeep.map((inst) => inst.id)
  );

  const symbolInstancesToDelete = existingSymbolInstances.filter(
    (instance) => !symbolInstancesIds.has(instance.id)
  );

  return {
    symbolInstancesToKeep,
    symbolInstancesToDelete,
  };
};
