import {
  FileLink,
  IdEither,
  RawDBRow,
  RawDBRowInsert,
  RawDBRowKey,
} from '@cognite/sdk';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum SuitesTableActionTypes {
  SUITES_TABLE_LOAD = 'suitesTable/LOAD',
  SUITES_TABLE_LOADED = 'suitesTable/LOADED',
  SUITES_TABLE_LOAD_FAILED = 'suitesTable/LOAD_FAILED',
  SUITES_TABLE_ROW_INSERT = 'suitesTable/INSERT',
  SUITES_TABLE_ROW_ERROR = 'suitesTable/ERROR',
  SUITES_TABLE_ROW_DELETE = 'suitesTable/DELETE',
  FETCH_IMG_URLS = 'FETCH_IMG_URLS',
  FETCHED_IMG_URLS = 'FETCHED_IMG_URLS',
  FETCH_IMG_URLS_FAILED = 'FETCH_IMG_URLS_FAILED',
  CLEAR_IMG_URLS = 'CLEAR_IMG_URLS',
}

export type SuitesTableRootAction = ActionType<typeof actions>;

export type BoardType =
  | 'grafana'
  | 'powerbi'
  | 'plotly'
  | 'spotfire'
  | 'application'
  | 'infographics'
  | 'other';

export type Board = {
  key: string;
  type: BoardType | null;
  title: string;
  url: string;
  visibleTo?: string[];
  embedTag?: string;
  color?: string;
  lastVisitedTime?: number;
  imageFileId: string;
};

export type Suite = {
  key: string;
  title: string;
  description: string;
  boards: Board[];
  color: string;
  createdTime: number;
  lastUpdatedTime?: Date;
};

export type ImgUrlLink = FileLink & IdEither;

export type ImgUrls = {
  loading: boolean;
  loaded: boolean;
  failed: boolean;
  urls: ImgUrlLink[];
};

export interface SuiteRow extends RawDBRow {}
export interface SuiteRowInsert extends RawDBRowInsert {}
export interface SuiteRowDelete extends RawDBRowKey {}

export interface SuitesTableState {
  loading: boolean;
  loaded: boolean;
  loadFailed: boolean;
  suites: Suite[] | null;
  imageUrls: ImgUrls;
}
