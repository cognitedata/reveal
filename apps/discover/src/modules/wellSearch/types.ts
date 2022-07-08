import { WellInternal } from 'domain/wells/well/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { PlotData } from 'plotly.js';

import { Sequence as DefaultSequence, Asset } from '@cognite/sdk';
import { AssetSource, WellFilter } from '@cognite/sdk-wells';

import { DataError } from 'modules/inspectTabs/types';

import { TableResults } from '../../components/Tablev3/resultTypes';
import { UserPreferredUnit } from '../../constants/units';
import { DocumentType } from '../documentSearch/types';

import { FilterIDs } from './constants';

export const TOGGLE_SELECTED_WELLS = 'WELL_TOGGLE_SELECTED_WELLS';
export const TOGGLE_SELECTED_WELLBORE_OF_WELL =
  'WELL_TOGGLE_SELECTED_WELLBORE_OF_WELL';
export const TOGGLE_EXPANDED_WELL_ID = 'WELL_TOGGLE_EXPANDED_WELL_ID';

export const SET_WELLBORE_ASSETS = 'WELL_SET_WELLBORE_ASSETS';
export const SET_WELLBORE_DIGITAL_ROCK_SAMPLES =
  'WELL_SET_WELLBORE_DIGITAL_ROCK_SAMPLES';
export const SET_GRAIN_ANALYSIS_DATA = 'WELL_SET_GRAIN_ANALYSIS_DATA';

export const WELL_ADD_SELECTED_COLUMN = 'WELL_ADD_SELECTED_COLUMN';
export const WELL_REMOVE_SELECTED_COLUMN = 'WELL_REMOVE_SELECTED_COLUMN';
export const WELL_SET_SELECTED_COLUMN = 'WELL_SET_SELECTED_COLUMN';

// well state:

export type LogTypes = 'logs' | 'logsFrmTops';
export type AssetTypes = 'digitalRocks';
export type GrainAnalysisTypes = 'gpart';

export interface WellState {
  selectedWellIds: TableResults;
  selectedWellboreIds: TableResults;
  expandedWellIds: TableResults;
  wellboreData: WellboreData;
  selectedColumns: string[];
}

// other types:

export interface Sequence extends Omit<DefaultSequence, 'assetId'> {
  wellboreId?: WellboreId;
  assetId?: AssetSource['assetExternalId'];
}

export interface WellboreDigitalRockSamples {
  wellboreId: string;
  digitalRockId: number;
  digitalRockSamples: Asset[];
}

interface ToggleExpandedWellId {
  type: typeof TOGGLE_EXPANDED_WELL_ID;
  id: string;
  reset?: boolean;
}

interface ToggleSelectedWells {
  clear?: boolean;
  type: typeof TOGGLE_SELECTED_WELLS;
  wells: WellInternal[];
  isSelected: boolean;
}

interface ToggleSelectedWellboreOfWell {
  type: typeof TOGGLE_SELECTED_WELLBORE_OF_WELL;
  well: WellInternal;
  wellboreId: WellboreId;
  isSelected: boolean;
}

interface SetGrainAnalysisData {
  type: typeof SET_GRAIN_ANALYSIS_DATA;
  digitalRockSample: Asset;
  grainAnalysisType: GrainAnalysisTypes;
  data: SequenceData[];
}

interface SetWellboreAssets {
  type: typeof SET_WELLBORE_ASSETS;
  data: { [key: string]: Asset[] };
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
  | SetWellboreAssets
  | SetWellboreDigitalRockSamples
  | SetGrainAnalysisData
  | AddSelectedColumn
  | RemoveSelectedColumn
  | SetSelectedColumn;

export interface WellResult {
  wells: WellInternal[];
  error?: Error;
}

export type WellId = string;
export type WellboreId = string;

export type WellFilterOptionValue = string | number;

export type WellFilterOption = {
  value: WellFilterOptionValue;
  count: number;
};

export type WellFilterMapValue = WellFilterOptionValue[] | string;

export interface WellFilterMap {
  [key: number]: WellFilterMapValue;
}

export interface WellMap {
  [key: number]: WellInternal;
}

export type WellFormatFilter = { [key: string]: WellFilterOptionValue[] };

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
  [key: string]: {
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
  MULTISELECT_GROUP,
  NUMERIC_RANGE,
  DATE_RANGE,
}

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
    userPreferredUnit: UserPreferredUnit
  ) => WellFilter;
  isTextCapitalized?: boolean;
};

export type FilterConfigMap = {
  [key: number]: FilterConfig;
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
  [key: WellboreId]: string;
};

export type WellboreExternalAssetIdMap = {
  [key: string]: string;
};

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
  GEOMECHANNICS = 'geomechanics',
  PPFG = 'ppfg',
  FIT = 'fit',
  LOT = 'lot',
}

export enum GeoPpfgFilterTypes {
  GEOMECHANNICS,
  PPFG,
  OTHER,
}

export type MeasurementCurveConfig = {
  [key: string]: {
    [key: string]: Partial<PlotData>;
  };
};

export type MeasurementChartData = Partial<PlotData> & {
  measurementType: MeasurementType;
};

export type WellboreProcessedData = {
  wellbore: WellboreInternal;
  proccessedData: ProcessedData;
};

/**
 * Store charts and errors encountered after processing Measurement
 */
export type ProcessedData = {
  chartData: MeasurementChartData[];
  errors: DataError[];
};

export type RegionFieldBlock =
  | FilterIDs.REGION
  | FilterIDs.FIELD
  | FilterIDs.BLOCK;

export type RegionFieldBlockHierarchy = {
  [key in RegionFieldBlock]: {
    parents: RegionFieldBlock[];
    children: RegionFieldBlock[];
    revalidate: { reference: RegionFieldBlock; filterId: RegionFieldBlock }[];
  };
};

export type RegionFieldBlockResult = { [key in RegionFieldBlock]: string[] };
