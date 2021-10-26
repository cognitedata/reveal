import { Dictionary } from '@reduxjs/toolkit';
import { PlotData } from 'plotly.js';

import { Metadata, Sequence, Asset, CogniteEvent } from '@cognite/sdk';
import {
  NPT,
  Well as SDKWell,
  Wellbore as WellboreV2,
  WellFilter,
} from '@cognite/sdk-wells-v2';
import { Wellbore as WellboreV3 } from '@cognite/sdk-wells-v3';
import { Point } from '@cognite/seismic-sdk-js';

import { PossibleDateRangeDate } from '../../_helpers/date';
import { TableResults } from '../../components/tablev2/types';
import { DocumentType } from '../documentSearch/types';

export const SET_WELLS_DATA = 'WELL_SET_WELLS_DATA';
export const SET_SELECTED_WELL_ID = 'WELL_SET_SELECTED_WELL_ID';
export const SET_SELECTED_WELLBORE_IDS = 'WELL_SET_SELECTED_WELLBORE_IDS';
export const SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID =
  'SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID';
export const SET_SEARCH_PHRASE = 'WELL_SET_SEARCH_PHRASE';
export const SET_HAS_SEARCHED = 'WELL_SET_HAS_SEARCHED';
export const SET_WELLBORES = 'WELL_SET_WELLBORES';
export const SET_SEQUENCES = 'WELL_SET_SEQUENCES';
export const SET_IS_SEARCHING = 'WELL_SET_IS_SEARCHING';
export const RESET_QUERY = 'WELL_RESET_QUERY';
export const TOGGLE_EXPANDED_WELL_ID = 'WELL_TOGGLE_EXPANDED_WELL_ID';
export const TOGGLE_SELECTED_WELLS = 'WELL_TOGGLE_SELECTED_WELLS';
export const SET_SELECTED_SECONDARY_WELL_IDS =
  'SET_SELECTED_SECONDARY_WELL_IDS';
export const SET_SELECTED_SECONDARY_WELLBORE_IDS =
  'SET_SELECTED_SECONDARY_WELLBORE_IDS';

export const SET_LOG_TYPE = 'WELL_SET_LOG_TYPE';
export const SET_LOGS_ROW_DATA = 'WELL_SET_LOGS_ROW_DATA';
export const SET_WELLBORE_SEQUENCES = 'WELL_SET_WELLBORE_SEQUENCES';
export const SET_PPFG_ROW_DATA = 'WELL_SET_PPFG_ROW_DATA';
export const SET_GEOMECHANIC_ROW_DATA = 'WELL_SET_GEOMECHANIC_ROW_DATA';
export const SET_WELLBORE_ASSETS = 'WELL_SET_WELLBORE_ASSETS';
export const SET_WELLBORE_DIGITAL_ROCK_SAMPLES =
  'WELL_SET_WELLBORE_DIGITAL_ROCK_SAMPLES';
export const SET_GRAIN_ANALYSIS_DATA = 'WELL_SET_GRAIN_ANALYSIS_DATA';

export const SET_ALL_WELLBORES_FETCHING = 'WELL_SET_ALL_WELLBORES_FETCHING';
export const SET_WELLBORES_FETCHED_WELL_IDS =
  'WELL_SET_WELLBORES_FETCHED_WELL_IDS';

export const WELL_ADD_SELECTED_COLUMN = 'WELL_ADD_SELECTED_COLUMN';
export const WELL_REMOVE_SELECTED_COLUMN = 'WELL_REMOVE_SELECTED_COLUMN';
export const WELL_SET_SELECTED_COLUMN = 'WELL_SET_SELECTED_COLUMN';

/**
 * Which wellbore and it's well head is currenlty move hovered
 */
export const SET_HOVERED_WELLBORE_IDS = 'SET_HOVERED_WELLBORE_IDS';
export const SET_INSECT_WELLBORES_CONTEXT = 'SET_INSECT_WELLBORES_CONTEXT';

// which well is selected for the well card

export const SET_WELL_CARD_SELECTED_WELL_ID = 'SET_WELL_CARD_SELECTED_WELL_ID';
export const SET_WELL_CARD_SELECTED_WELLBORE_ID =
  'SET_WELL_CARD_SELECTED_WELLBORE_ID';

export const SET_FAVORITE_HOVERED_OR_CHECKED_WELLS =
  'SET_FAVORITE_HOVERED_OR_CHECKED_WELLS';
export const SET_FAVORITE_ID = 'SET_FAVORITE_ID';

// well state:

export type EventsType = 'nds' | 'npt';
export type LogTypes = 'logs' | 'logsFrmTops';
export type SequenceTypes = 'ppfg' | 'geomechanic' | 'fit' | 'lot';
export type AssetTypes = 'digitalRocks';
export type GrainAnalysisTypes = 'gpart';
export type DictionaryType<T> = Dictionary<T>;

export enum InspectWellboreContext {
  NOT_SPECIFIED,
  CHECKED_WELLBORES,
  HOVERED_WELLBORES,
  WELL_CARD_WELLBORES,
  FAVORITE_HOVERED_WELL,
  FAVORITE_CHECKED_WELLS,
}

export interface WellState {
  wells: Well[];
  currentQuery: WellQuery;
  selectedWellIds: TableResults;
  expandedWellIds: TableResults;
  hoveredWellId?: number;
  selectedFavoriteId?: string;
  isSearching: boolean;
  allWellboresFetching: boolean;
  wellboresFetchedWellIds: Well['id'][];
  wellboreData: WellboreData;
  selectedColumns: string[];
  selectedWellboreIds: TableResults;
  hoveredWellboreIds: TableResults;
  wellCardSelectedWellId?: number;
  wellCardSelectedWellBoreId: TableResults;
  wellFavoriteHoveredOrCheckedWells: number[];
  inspectWellboreContext: InspectWellboreContext;
  selectedSecondaryWellIds: TableResults;
  selectedSecondaryWellboreIds: TableResults;
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
  wellboreId: number;
  externalId: string;
  columns: TrajectoryColumnR[];
  rows: TrajectoryRow[];
}

export interface WellboreDigitalRockSamples {
  wellboreId: number;
  digitalRockId: number;
  digitalRockSamples: Asset[];
}

export interface SetIsSearching {
  type: typeof SET_IS_SEARCHING;
  isSearching: WellState['isSearching'];
}

export interface SetAllWellboresFetching {
  type: typeof SET_ALL_WELLBORES_FETCHING;
  allWellboresFetching: WellState['allWellboresFetching'];
}

export interface SetWellboresFetched {
  type: typeof SET_WELLBORES_FETCHED_WELL_IDS;
  wellIds: number[];
}

interface ResetQuery {
  type: typeof RESET_QUERY;
}

interface SetWellsData {
  type: typeof SET_WELLS_DATA;
  wells: Well[];
}

interface SetWellbores {
  type: typeof SET_WELLBORES;
  data: { [wellId: number]: Wellbore[] };
}

interface SetSequences {
  type: typeof SET_SEQUENCES;
  wellId: number;
  wellboreId: number;
  sequences: WellSequence[];
}

interface SetSelectedWellId {
  type: typeof SET_SELECTED_WELL_ID;
  id: number;
  value: boolean;
}

interface SetSearchPhrase {
  type: typeof SET_SEARCH_PHRASE;
  phrase: string;
}

interface SetHasSearched {
  type: typeof SET_HAS_SEARCHED;
  hasSearched: boolean;
}

interface SetSelectedWellboreIds {
  type: typeof SET_SELECTED_WELLBORE_IDS;
  ids: TableResults;
}

interface SetSelectedWellboreIdsWithWellId {
  type: typeof SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID;
  ids: TableResults;
  wellId: number;
}

interface ToggleExpandedWellId {
  type: typeof TOGGLE_EXPANDED_WELL_ID;
  id: number;
}

interface ToggleSelectedWells {
  type: typeof TOGGLE_SELECTED_WELLS;
  value: boolean;
}

interface SetLogType {
  type: typeof SET_LOG_TYPE;
  data: {
    logs: { [key: number]: Sequence[] };
    logsFrmTops: { [key: number]: Sequence[] };
  };
}

interface SetWellboreSequences {
  type: typeof SET_WELLBORE_SEQUENCES;
  data: { [key: number]: Sequence[] };
  sequenceType: SequenceTypes;
}

interface SetPPFGData {
  type: typeof SET_PPFG_ROW_DATA;
  data: SequenceData[];
}

interface SetGeomechanicData {
  type: typeof SET_GEOMECHANIC_ROW_DATA;
  data: SequenceData[];
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

export const SET_HOVERED_WELL = 'wells/SET_HOVERED_WELL';
interface SetHoveredWell {
  type: typeof SET_HOVERED_WELL;
  wellId?: number;
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

interface SetHoveredWellbores {
  type: typeof SET_HOVERED_WELLBORE_IDS;
  wellId: number;
  wellboreId?: number;
}

interface SetWellCardSelectedWellId {
  type: typeof SET_WELL_CARD_SELECTED_WELL_ID;
  wellId: number;
}

interface SetFavoriteHoveredOrCheckedWell {
  type: typeof SET_FAVORITE_HOVERED_OR_CHECKED_WELLS;
  wellIds: number[];
}

interface SetFavoriteId {
  type: typeof SET_FAVORITE_ID;
  favoriteId: string;
}

interface SetWellCardSelectedWellBoreId {
  type: typeof SET_WELL_CARD_SELECTED_WELLBORE_ID;
  wellboreIds: number[];
}

interface SetInspectWellboreContext {
  type: typeof SET_INSECT_WELLBORES_CONTEXT;
  context: InspectWellboreContext;
}

interface SetSelectedSecondaryWellboreIds {
  type: typeof SET_SELECTED_SECONDARY_WELLBORE_IDS;
  ids: TableResults;
}

interface SetSelectedSecondaryWellIds {
  type: typeof SET_SELECTED_SECONDARY_WELL_IDS;
  ids: TableResults;
  reset: boolean;
}

export type WellSearchAction =
  | SetHoveredWell
  | SetIsSearching
  | ResetQuery
  | SetWellsData
  | SetWellbores
  | SetSequences
  | SetSelectedWellId
  | SetSearchPhrase
  | SetHasSearched
  | SetSelectedWellboreIds
  | ToggleExpandedWellId
  | ToggleSelectedWells
  | SetLogType
  | SetLogsData
  | SetPPFGData
  | SetGeomechanicData
  | SetWellboreSequences
  | SetWellboreAssets
  | SetWellboreDigitalRockSamples
  | SetGrainAnalysisData
  | SetAllWellboresFetching
  | SetWellboresFetched
  | AddSelectedColumn
  | RemoveSelectedColumn
  | SetSelectedColumn
  | SetSelectedWellboreIdsWithWellId
  | SetHoveredWellbores
  | SetInspectWellboreContext
  | SetWellCardSelectedWellId
  | SetWellCardSelectedWellBoreId
  | SetFavoriteHoveredOrCheckedWell
  | SetFavoriteId
  | SetSelectedSecondaryWellIds
  | SetSelectedSecondaryWellboreIds;
interface WellQuery {
  phrase: string;
  hasSearched: boolean;
}

export interface Well extends Omit<SDKWell, 'wellbores'> {
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
export interface Wellbore
  extends Omit<WellboreV2, 'id' | 'wellId'>,
    Partial<Omit<WellboreV3, 'name' | 'matchingId'>> {
  id: any;
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
export interface WellBoreListMap {
  [key: number]: Wellbore[];
}

export interface WellFilterOptionMap {
  [key: number]: (WellFilterOption | WellFilterOptionValue)[];
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
    ppfg?: SequenceData[];
    fit?: SequenceData[];
    lot?: SequenceData[];
    geomechanic?: SequenceData[];
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

export type FilterConfig = {
  id: number;
  name: string;
  key: string;
  category: string;
  type: FilterTypes;
  fetcher?: () =>
    | Promise<any | string[] | number[] | (Date | undefined)[]>
    | undefined;
  filterParameters?: (filters: string[] | Date[] | number[]) => WellFilter;
  isTextCapitalized?: boolean;
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

export type WellboreTrajectoryDataMap = {
  [key: string]: TrajectoryData[];
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

export type MeasurementType = 'geomechanic' | 'ppfg' | 'fit' | 'lot';
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
