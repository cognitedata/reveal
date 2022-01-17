export type ToolType =
  | 'addSymbol'
  | 'addLine'
  | 'connectInstances'
  | 'connectLabels'
  | 'graphExplorer'
  | 'selectDocumentType'
  | 'setLineNumber';

export enum DocumentType {
  pid = 'P&ID',
  isometric = 'Isometric',
  unknown = 'Unknown',
}
