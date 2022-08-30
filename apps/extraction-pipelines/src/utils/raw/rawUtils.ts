import { ExtpipeRawTable } from 'model/Extpipe';

export enum RawTableOptions {
  YES = 'Yes',
  NO = 'No',
}
export interface RawTableFormInput {
  rawTable: RawTableOptions | '';
  selectedRawTables: ExtpipeRawTable[];
}

export const mapStoredToDefault = (
  rawTables: ExtpipeRawTable[] | undefined
): RawTableFormInput => {
  if (!rawTables) {
    return {
      rawTable: '',
      selectedRawTables: [],
    };
  }
  if (rawTables.length === 0) {
    return {
      rawTable: RawTableOptions.NO,
      selectedRawTables: [],
    };
  }
  return {
    rawTable: RawTableOptions.YES,
    selectedRawTables: rawTables,
  };
};
