export type ToolType =
  | 'addSymbol'
  | 'addLine'
  | 'connectInstances'
  | 'connectLabels'
  | 'graphExplorer';

export type SaveSymbolConflictResolution = 'add' | 'rename';

export type ExistingSymbolPromptData = {
  symbolName: string;
  svgElements: SVGElement[];
  resolution?: SaveSymbolConflictResolution;
};
