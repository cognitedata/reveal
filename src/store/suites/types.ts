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
  SUITES_TABLE_REQUEST_SUCCESS = 'suitesTable/REQUEST_SUCCESS',
  SUITES_TABLE_LOAD = 'suitesTable/LOAD',
  SUITES_TABLE_LOADED = 'suitesTable/LOADED',
  SUITES_TABLE_LOAD_ERROR = 'suitesTable/ERROR',
  SUITES_TABLE_ROW_INSERT = 'suitesTable/INSERT',
  SUITES_TABLE_ROW_INSERT_ERROR = 'suitesTable/INSERT_ERROR',
  SUITES_TABLE_ROW_DELETE = 'suitesTable/DELETE',
  SUITES_TABLE_ROW_DELETE_ERROR = 'suitesTable/DELETE_ERROR',
  FETCH_IMG_URLS = 'FETCH_IMG_URLS',
  FETCHED_IMG_URLS = 'FETCHED_IMG_URLS',
  FETCH_IMG_URLS_ERROR = 'FETCH_IMG_URLS_ERROR',
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
  urls: ImgUrlLink[];
};

export interface SuiteRow extends RawDBRow {}
export interface SuiteRowInsert extends RawDBRowInsert {}
export interface SuiteRowDelete extends RawDBRowKey {}

export interface SuitesTableState {
  loading: boolean;
  loaded: boolean;
  error?: string;
  suites: Suite[] | null;
  imageUrls: ImgUrls;
}
