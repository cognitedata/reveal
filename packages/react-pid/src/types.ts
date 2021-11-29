export type ToolType = 'addSymbol' | 'addLine' | 'connectInstances';

export type SaveSymbolConflictResolution = 'add' | 'rename';

export type ExistingSymbolPromptData = {
  symbolName: string;
  svgElements: SVGElement[];
  resolution?: SaveSymbolConflictResolution;
};
