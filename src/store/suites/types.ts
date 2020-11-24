import { RawDBRow } from '@cognite/sdk';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export enum SuitesTableActionTypes {
  SUITES_TABLE_LOAD = 'suitesTable/LOAD',
  SUITES_TABLE_LOADED = 'suitesTable/LOADED',
  SUITES_TABLE_LOAD_ERROR = 'suitesTable/ERROR',
}

export type SuitesTableRootAction = ActionType<typeof actions>;

export type DashboardType = 'grafana' | 'powerbi' | 'plotty' | 'other';

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

export interface SuitesTableState {
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  error?: string;
  suites: Suite[] | null;
}
