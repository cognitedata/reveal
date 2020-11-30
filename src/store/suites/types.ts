import { RawDBRow, RawDBRowInsert, RawDBRowKey } from '@cognite/sdk';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum SuitesTableActionTypes {
  SUITES_TABLE_LOAD = 'suitesTable/LOAD',
  SUITES_TABLE_LOADED = 'suitesTable/LOADED',
  SUITES_TABLE_LOAD_ERROR = 'suitesTable/ERROR',
  SUITES_TABLE_ROW_INSERT = 'suitesTable/INSERT',
  SUITES_TABLE_ROW_INSERTED = 'suitesTable/INSERTED',
  SUITES_TABLE_ROW_INSERT_ERROR = 'suitesTable/INSERT_ERROR',
  SUITES_TABLE_ROW_DELETE = 'suitesTable/DELETE',
  SUITES_TABLE_ROW_DELETED = 'suitesTable/DELETED',
  SUITES_TABLE_ROW_DELETE_ERROR = 'suitesTable/DELETE_ERROR',
}

export type SuitesTableRootAction = ActionType<typeof actions>;

export type DashboardType = 'grafana' | 'powerbi' | 'plotly' | 'other';

export type Dashboard = {
  key: string;
  type: DashboardType;
  title: string;
  url: string;
  visibleTo?: string[];
  embedTag?: string;
};

export type Suite = {
  key: string;
  title: string;
  visibleTo: string[];
  dashboards: Dashboard[];
  color: string;
  lastUpdatedTime: Date;
};

export interface SuiteRow extends RawDBRow {}
export interface SuiteRowInsert extends RawDBRowInsert {}
export interface SuiteRowDelete extends RawDBRowKey {}

export interface SuitesTableState {
  loading: boolean;
  loaded: boolean;
  error?: string;
  suites: Suite[] | null;
}
