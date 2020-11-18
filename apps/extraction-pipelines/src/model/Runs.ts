import { Column, Cell, Row } from 'react-table';

export interface TableProps {
  data: {
    timestamp: number;
    status: string;
    statusSeen: string;
  }[];
  columns: Column[];
}

export interface CellProps {
  row: Row;
  cell: Cell;
}

export interface RunsAPIResponse {
  items: IntegrationProps[];
}

export interface IntegrationProps {
  createdTime: number;
  lastUpdatedTime: number;
  externalId: string;
  statuses: RunAPIProps[];
  id: number;
}

export interface RunAPIProps {
  timestamp: number;
  status: string;
}

export interface RunsProps {
  timestamp: number;
  status: string;
  statusSeen: string;
  subRows: RunProps[];
}

export interface RunProps {
  timestamp: number;
  status: string;
  statusSeen: string;
}
