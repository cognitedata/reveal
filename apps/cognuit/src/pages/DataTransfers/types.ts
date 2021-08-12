import { DataTransfersResponse } from 'types/ApiInterface';

export type MappedColumnNames = {
  name: DataTransfersTableKeys | DataTransfersTableKeys[];
  parent?: DataTransfersTableKeys;
};
export type DataTransfersTableKeys = keyof DataTransfersTableData;

export interface DataTransfersTableData extends DataTransfersResponse {
  id: DataTransfersResponse['source']['id'];
}
