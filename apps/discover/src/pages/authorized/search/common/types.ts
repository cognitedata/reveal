export interface Column {
  field: string;
  name: string;
  order?: number;
}

export interface AvailableColumn extends Column {
  selected?: boolean;
  disabled?: boolean;
}
