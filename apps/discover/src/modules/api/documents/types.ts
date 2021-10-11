import { GenericApiError, BaseAPIResult } from '../types';

export type DocumentError = GenericApiError;

export interface DocumentPayloadBase {
  name: string;
  count: number;
}
export interface DocumentPayloadLabel extends DocumentPayloadBase {
  id: string; // some things need this, eg: labels
}
export type DocumentPayload = DocumentPayloadBase | DocumentPayloadLabel;

export type DocumentCategory = {
  [x in 'labels' | 'fileCategory' | 'location']: DocumentPayload[];
};
export interface DocumentCategoryResult extends BaseAPIResult {
  data: DocumentCategory;
}
