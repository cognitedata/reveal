export interface SymbolConnectionId {
  fileName: string;
  instanceId: string;
}

export interface SymbolConnection {
  from: SymbolConnectionId;
  to: SymbolConnectionId;
}
