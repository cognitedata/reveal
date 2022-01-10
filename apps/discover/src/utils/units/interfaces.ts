export interface UnitConverterItem {
  accessor: string;
  from?: string;
  fromAccessor?: string;
  id?: string;
  errorHandler?: (err: string) => void;
  to: string;
}
