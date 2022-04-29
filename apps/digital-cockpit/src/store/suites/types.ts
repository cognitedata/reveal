import { FileLink, IdEither } from '@cognite/sdk';
import { ActionType } from 'typesafe-actions';

import * as actions from './actions';

export enum SuitesTableActionTypes {
  SUITES_TABLE_LOAD = 'suitesTable/LOAD',
  SUITES_TABLE_LOADED = 'suitesTable/LOADED',
  SUITES_TABLE_LOAD_FAILED = 'suitesTable/LOAD_FAILED',
  REPLACE_SUITES = 'suitesTable/REPLACE_SUITES',
  SUITE_SAVE = 'suite/SAVE',
  SUITE_ERROR = 'suite/ERROR',
  SUITE_DELETE = 'suite/DELETE',
  FETCH_IMG_URLS = 'suite/FETCH_IMG_URLS',
  FETCHED_IMG_URLS = 'suite/FETCHED_IMG_URLS',
  FETCH_IMG_URLS_FAILED = 'suite/FETCH_IMG_URLS_FAILED',
  CLEAR_IMG_URLS = 'suite/CLEAR_IMG_URLS',
}

export type SuitesTableRootAction = ActionType<typeof actions>;

export type BoardType = 'grafana' | 'powerbi' | 'plotly' | 'spotfire' | 'other';

export type Board = {
  key: string;
  type: BoardType | null;
  title: string;
  url: string;
  visibleTo?: string[];
  embedTag?: string;
  imageFileId: string;
};

export type Suite = {
  key: string;
  title: string;
  description: string;
  boards: Board[];
  color: string;
  order: number;
  parent?: string | null;
  suites?: string[];
};

export type ImgUrlLink = FileLink & IdEither;

export type ImgUrls = {
  loading: boolean;
  loaded: boolean;
  failed: boolean;
  urls: ImgUrlLink[];
};

export interface SuitesTableState {
  loading: boolean;
  loaded: boolean;
  loadFailed: boolean;
  suites: Suite[] | null;
  imageUrls: ImgUrls;
}

export type SuitesByKey = {
  [key: string]: Suite;
};
