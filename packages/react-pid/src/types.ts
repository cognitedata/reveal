export type ToolType =
  | 'addSymbol'
  | 'addLine'
  | 'splitLine'
  | 'connectInstances'
  | 'connectLabels'
  | 'graphExplorer'
  | 'selectDocumentType'
  | 'setLineNumber'
  | 'addEquipmentTag';

export enum DocumentType {
  pid = 'P&ID',
  isometric = 'Isometric',
  unknown = 'Unknown',
}
