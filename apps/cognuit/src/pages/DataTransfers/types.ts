import {
  DataTransfersResponse,
  ObjectsRevisionsResponse,
} from 'types/ApiInterface';

export type DataTransfersTableKeys = keyof DataTransfersTableData;

export interface DataTransfersTableData extends ObjectsRevisionsResponse {
  report: DataTransfersResponse['status'];
  status: DataTransfersResponse['status'];
}
