import { Dictionary } from '@reduxjs/toolkit';
import { PlotData } from 'plotly.js';

import { ProjectConfigWellsTrajectoryColumns } from '@cognite/discover-api-types';
import { Metadata, Sequence, Asset, CogniteEvent } from '@cognite/sdk';
import {
  NPT,
  Well as SDKWell,
  Wellbore as WellboreV2,
  WellFilter,
} from '@cognite/sdk-wells-v2';
import {
  Wellbore as WellboreV3,
  WellFilter as WellFilterV3,
} from '@cognite/sdk-wells-v3';
import { Point } from '@cognite/seismic-sdk-js';

import { TableResults } from '../../components/tablev3/resultTypes';
import { UserPrefferedUnit } from '../../constants/units';
import { PossibleDateRangeDate } from '../../utils/date';
import { DocumentType } from '../documentSearch/types';

export const TOGGLE_SELECTED_WELLS = 'WELL_TOGGLE_SELECTED_WELLS';
export const TOGGLE_SELECTED_WELLBORE_OF_WELL =
  'WELL_TOGGLE_SELECTED_WELLBORE_OF_WELL';
export const TOGGLE_EXPANDED_WELL_ID = 'WELL_TOGGLE_EXPANDED_WELL_ID';

export const SET_LOG_TYPE = 'WELL_SET_LOG_TYPE';
export const SET_LOGS_ROW_DATA = 'WELL_SET_LOGS_ROW_DATA';
export const SET_WELLBORE_ASSETS = 'WELL_SET_WELLBORE_ASSETS';
export const SET_WELLBORE_DIGITAL_ROCK_SAMPLES =
  'WELL_SET_WELLBORE_DIGITAL_ROCK_SAMPLES';
export const SET_GRAIN_ANALYSIS_DATA = 'WELL_SET_GRAIN_ANALYSIS_DATA';

export const WELL_ADD_SELECTED_COLUMN = 'WELL_ADD_SELECTED_COLUMN';
export const WELL_REMOVE_SELECTED_COLUMN = 'WELL_REMOVE_SELECTED_COLUMN';
export const WELL_SET_SELECTED_COLUMN = 'WELL_SET_SELECTED_COLUMN';

// well state:

export type EventsType = 'nds' | 'npt';
export type LogTypes = 'logs' | 'logsFrmTops';
export type AssetTypes = 'digitalRocks';
export type GrainAnalysisTypes = 'gpart';
export type DictionaryType<T> = Dictionary<T>;

export interface WellState {
  selectedWellIds: TableResults;
  selectedWellboreIds: TableResults;
  expandedWellIds: TableResults;
  wellboreData: WellboreData;
  selectedColumns: string[];
}

// other types:

export interface TrajectoryColumnR {
  name: string;
  externalId?: string;
  valueType: string;
}
export interface TrajectoryRow {
  rowNumber: number;
  values: number[];
}
export interface TrajectoryData {
  sequence: Sequence;
  rowData?: TrajectoryRows;
}

export interface TrajectoryRows {
  id: number;
  wellboreId: WellboreId;
  externalId: string;
  columns: ProjectConfigWellsTrajectoryColumns[];
  rows: TrajectoryRow[];
}

export interface WellboreDigitalRockSamples {
  wellboreId: number;
  digitalRockId: number;
  digitalRockSamples: Asset[];
}

interface ToggleExpandedWellId {
  type: typeof TOGGLE_EXPANDED_WELL_ID;
  id: number;
  reset?: boolean;
}

interface ToggleSelectedWells {
  clear?: boolean;
  type: typeof TOGGLE_SELECTED_WELLS;
  wells: Well[];
  isSelected: boolean;
}

interface ToggleSelectedWellboreOfWell {
  type: typeof TOGGLE_SELECTED_WELLBORE_OF_WELL;
  well: Well;
  wellboreId: WellboreId;
  isSelected: boolean;
}

interface SetLogType {
  type: typeof SET_LOG_TYPE;
  data: {
    logs: { [key: number]: Sequence[] };
    logsFrmTops: { [key: number]: Sequence[] };
  };
}

interface SetGrainAnalysisData {
  type: typeof SET_GRAIN_ANALYSIS_DATA;
  digitalRockSample: Asset;
  grainAnalysisType: GrainAnalysisTypes;
  data: SequenceData[];
}

type RowLogsResponse = {
  log: Sequence;
  rows: SequenceRow[];
};

interface SetLogsData {
  type: typeof SET_LOGS_ROW_DATA;
  data: {
    logs: RowLogsResponse[];
    logsFrmTops: RowLogsResponse[];
  };
}

interface SetWellboreAssets {
  type: typeof SET_WELLBORE_ASSETS;
  data: { [key: number]: Asset[] };
  assetType: AssetTypes;
}

interface SetWellboreDigitalRockSamples {
  type: typeof SET_WELLBORE_DIGITAL_ROCK_SAMPLES;
  data: WellboreDigitalRockSamples[];
}

interface AddSelectedColumn {
  type: typeof WELL_ADD_SELECTED_COLUMN;
  column: string;
}

interface RemoveSelectedColumn {
  type: typeof WELL_REMOVE_SELECTED_COLUMN;
  column: string;
}

interface SetSelectedColumn {
  type: typeof WELL_SET_SELECTED_COLUMN;
  columns: string[];
}

export type WellSearchAction =
  | ToggleExpandedWellId
  | ToggleSelectedWells
  | ToggleSelectedWellboreOfWell
  | SetLogType
  | SetLogsData
  | SetWellboreAssets
  | SetWellboreDigitalRockSamples
  | SetGrainAnalysisData
  | AddSelectedColumn
  | RemoveSelectedColumn
  | SetSelectedColumn;

export interface Well extends Omit<SDKWell, 'id' | 'wellbores'> {
  id: WellId;
  geometry?: Point;
  wellbores?: Wellbore[];
  description?: string;
  spudDate?: any;
}

export interface WellName {
  id: number;
  name: string;
}

// @sdk-wells-v3
export type WellId = any;
export type WellboreId = any;
export interface Wellbore
  extends Omit<WellboreV2, 'id' | 'wellId'>,
    Partial<Omit<WellboreV3, 'name' | 'matchingId'>> {
  id: WellboreId;
  matchingId?: string;
  wellId?: number;
  sequences?: WellSequence[];
  metadata?: Metadata;
  parentExternalId?: string;
  description?: string;
}

export interface WellSequence {
  name: string;
  id: number;
  metadata: WellSequenceMetadata;
}

interface WellSequenceMetadata {
  subtype: string;
  type: string;
  source: string;
  fileType: string;
}

export type WellFilterOptionValue = string | number | PossibleDateRangeDate;

export type WellFilterOption = {
  value: WellFilterOptionValue;
  count: number;
};

export type WellFilterMapValue = WellFilterOptionValue[] | string;

export interface WellFilterMap {
  [key: number]: WellFilterMapValue;
}

export interface WellMap {
  [key: number]: Well;
}

export interface SequenceData {
  sequence: Sequence;
  rows?: SequenceRow[];
}

export interface DigitalRockSampleData {
  asset: Asset;
  gpart?: SequenceData[];
}

export interface AssetData {
  asset: Asset;
  digitalRockSamples?: DigitalRockSampleData[];
}

export interface WellboreData {
  [key: number]: {
    logType?: SequenceData[];
    logsFrmTops?: SequenceData[];
    fit?: SequenceData[];
    lot?: SequenceData[];
    documents?: DocumentType[];
    digitalRocks?: AssetData[];
  };
}

export type TrackType =
  | 'MD'
  | 'TVD'
  | 'GR'
  | 'RDEEP'
  | 'D&N'
  | 'FRM'
  | 'NDS'
  | 'PPFG';

// Well Filter:

export enum FilterTypes {
  CHECKBOXES,
  MULTISELECT,
  NUMERIC_RANGE,
  DATE_RANGE,
}

/**
 * Certain filters are only available in Sdk v3, picking thoese filters to use with app well filter
 */
export type FiltersOnlySupportSdkV3 = Pick<
  WellFilterV3,
  'trajectories' | 'datum'
>;

/**
 * Type compbiled sdk v2 and picked fitlers from sdk v3
 */
export type CommonWellFilter = WellFilter & FiltersOnlySupportSdkV3;

export type FilterConfig = {
  id: number;
  name: string;
  key: string;
  category: string;
  type: FilterTypes;
  fetcher?: () =>
    | Promise<any | string[] | number[] | (Date | undefined)[]>
    | undefined;
  filterParameters?: (
    filters: string[] | Date[] | number[],
    userPreferredUnit: UserPrefferedUnit
  ) => CommonWellFilter;
  isTextCapitalized?: boolean;
  enableOnlySdkV3?: boolean;
};

export type FilterConfigMap = {
  [key: number]: FilterConfig;
};

export type WellboreSequencesMap = {
  [key: string]: Sequence[];
};

export type WellboreEventsMap = {
  [key: string]: CogniteEvent[];
};

export type WellboreNPTEventsMap = {
  [key: string]: NPT[];
};

type SequenceItem = number | string | null;
interface SequenceColumnBasicInfo {
  name?: string;
  // externalId?: ExternalId;
  // valueType?: SequenceValueType;
}
export class SequenceRow extends Array<SequenceItem> {
  constructor(
    public rowNumber: number,
    values: SequenceItem[],
    public columns: SequenceColumnBasicInfo[]
  ) {
    super(...values);
  }
}

export type WellboreIdMap = {
  [key: number]: number;
};

export type WellboreAssetIdMap = {
  [key: number]: number;
};

export type WellboreExternalIdMap = {
  [key: string]: number;
};

export type WellboreSourceExternalIdMap = {
  [key: string]: number;
};

export type IdWellboreMap = {
  [key: number]: Wellbore;
};

export interface NPTEvent extends NPT {
  wellboreId: number;
  wellName?: string;
  wellboreName?: string;
}

export interface FilterValues {
  id: number;
  value: WellFilterOptionValue;
  field?: string;
  category?: string;
  displayName?: string;
}

export interface FilterCategoricalData {
  title: string;
  filterConfigs: FilterConfig[];
  filterConfigIds: number[];
}

export enum MeasurementType {
  geomechanic,
  ppfg,
  fit,
  lot,
}

export interface Measurement extends Sequence {
  rows?: SequenceRow[];
}

export type WellboreMeasurementsMap = {
  [key: string]: Measurement[];
};

export type MeasurementCurveConfig = {
  [key in MeasurementType]: {
    [key: string]: Partial<PlotData>;
  };
};
export type MeasurementChartData = Partial<PlotData> & {
  measurementType: MeasurementType;
};
