export interface ILogRowColumn {
    externalId: string;
    valueType: string;
    name: string;
}

export interface ILogRow {
    [key: number]: number | null;
    rowNumber: number;
    columns: ILogRowColumn[];
}

export interface ILog {
    assetId: number;
    id: number;
    state: string;
    items: ILogRow[];
}
