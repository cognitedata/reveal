import { useQuery, UseQueryOptions } from 'react-query';
import { graphqlFetcher } from 'utils/graphqlFetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Represents the value of a data point. Can be either a String (<= 255 characters) or a number in the range [-1e100, 1e100].  */
  DataPointValue: any;
  /** Represents a 64-bit integer value. Note that some consumers as JavaScript only supports [-(2^53)+1, (2^53)-1]. */
  Int64: any;
  /** Represents a plain JSON object. */
  JSONObject: any;
  /** A timestamp with UTC-offset, formatted as a ISO-8601 date time string, with potentially microsecond resolution.Note as input the timestamp can be formatted as a number, which is assumed to represent milliseconds since Unix epoch. */
  Timestamp: any;
};

export type Building = {
  description?: Maybe<Scalars['String']>;
  externalId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  nodeId?: Maybe<Scalars['Int64']>;
  thumbnail?: Maybe<Scalars['String']>;
};

export type BuildingAggregateConnection = {
  edges: Array<Maybe<_BuildingAggregateEdge>>;
  items: Array<Maybe<BuildingAggregateResult>>;
  pageInfo: PageInfo;
};

export type BuildingAggregateResult = {
  avg?: Maybe<_BuildingAggregateFieldResult>;
  count?: Maybe<_BuildingAggregateFieldCountResult>;
  group?: Maybe<Scalars['JSONObject']>;
  histogram?: Maybe<_BuildingAggregateHistogramFieldResult>;
  max?: Maybe<_BuildingAggregateFieldResult>;
  min?: Maybe<_BuildingAggregateFieldResult>;
  sum?: Maybe<_BuildingAggregateFieldResult>;
};

export type BuildingAggregateResultHistogramArgs = {
  interval: Scalars['Int'];
};

export type BuildingConnection = {
  edges: Array<Maybe<_BuildingEdge>>;
  items: Array<Maybe<Building>>;
  pageInfo: PageInfo;
};

export type DataPoint = {
  timestamp?: Maybe<Scalars['Timestamp']>;
  value?: Maybe<Scalars['DataPointValue']>;
};

export type Equipment = {
  externalId: Scalars['ID'];
  isBroken?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  nodeId?: Maybe<Scalars['Int64']>;
  person?: Maybe<Person>;
  room?: Maybe<Room>;
  type?: Maybe<Scalars['String']>;
};

export type EquipmentAggregateConnection = {
  edges: Array<Maybe<_EquipmentAggregateEdge>>;
  items: Array<Maybe<EquipmentAggregateResult>>;
  pageInfo: PageInfo;
};

export type EquipmentAggregateResult = {
  avg?: Maybe<_EquipmentAggregateFieldResult>;
  count?: Maybe<_EquipmentAggregateFieldCountResult>;
  group?: Maybe<Scalars['JSONObject']>;
  histogram?: Maybe<_EquipmentAggregateHistogramFieldResult>;
  max?: Maybe<_EquipmentAggregateFieldResult>;
  min?: Maybe<_EquipmentAggregateFieldResult>;
  sum?: Maybe<_EquipmentAggregateFieldResult>;
};

export type EquipmentAggregateResultHistogramArgs = {
  interval: Scalars['Int'];
};

export type EquipmentConnection = {
  edges: Array<Maybe<_EquipmentEdge>>;
  items: Array<Maybe<Equipment>>;
  pageInfo: PageInfo;
};

export type Mutation = {
  _empty: Scalars['Boolean'];
};

export type PageInfo = {
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Person = {
  desk?: Maybe<Equipment>;
  externalId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  slackId?: Maybe<Scalars['String']>;
  team?: Maybe<Team>;
};

export type PersonAggregateConnection = {
  edges: Array<Maybe<_PersonAggregateEdge>>;
  items: Array<Maybe<PersonAggregateResult>>;
  pageInfo: PageInfo;
};

export type PersonAggregateResult = {
  avg?: Maybe<_PersonAggregateFieldResult>;
  count?: Maybe<_PersonAggregateFieldCountResult>;
  group?: Maybe<Scalars['JSONObject']>;
  histogram?: Maybe<_PersonAggregateHistogramFieldResult>;
  max?: Maybe<_PersonAggregateFieldResult>;
  min?: Maybe<_PersonAggregateFieldResult>;
  sum?: Maybe<_PersonAggregateFieldResult>;
};

export type PersonAggregateResultHistogramArgs = {
  interval: Scalars['Int'];
};

export type PersonConnection = {
  edges: Array<Maybe<_PersonEdge>>;
  items: Array<Maybe<Person>>;
  pageInfo: PageInfo;
};

export type Query = {
  aggregateBuilding?: Maybe<BuildingAggregateConnection>;
  aggregateEquipment?: Maybe<EquipmentAggregateConnection>;
  aggregatePerson?: Maybe<PersonAggregateConnection>;
  aggregateRoom?: Maybe<RoomAggregateConnection>;
  aggregateTeam?: Maybe<TeamAggregateConnection>;
  listBuilding?: Maybe<BuildingConnection>;
  listEquipment?: Maybe<EquipmentConnection>;
  listPerson?: Maybe<PersonConnection>;
  listRoom?: Maybe<RoomConnection>;
  listTeam?: Maybe<TeamConnection>;
  searchBuilding?: Maybe<BuildingConnection>;
  searchEquipment?: Maybe<EquipmentConnection>;
  searchPerson?: Maybe<PersonConnection>;
  searchRoom?: Maybe<RoomConnection>;
  searchTeam?: Maybe<TeamConnection>;
};

export type QueryAggregateBuildingArgs = {
  after?: InputMaybe<Scalars['String']>;
  fields?: InputMaybe<Array<_SearchBuildingFields>>;
  filter?: InputMaybe<_SearchBuildingFilter>;
  groupBy?: InputMaybe<Array<_SearchBuildingFields>>;
  query?: InputMaybe<Scalars['String']>;
};

export type QueryAggregateEquipmentArgs = {
  after?: InputMaybe<Scalars['String']>;
  fields?: InputMaybe<Array<_SearchEquipmentFields>>;
  filter?: InputMaybe<_SearchEquipmentFilter>;
  groupBy?: InputMaybe<Array<_SearchEquipmentFields>>;
  query?: InputMaybe<Scalars['String']>;
};

export type QueryAggregatePersonArgs = {
  after?: InputMaybe<Scalars['String']>;
  fields?: InputMaybe<Array<_SearchPersonFields>>;
  filter?: InputMaybe<_SearchPersonFilter>;
  groupBy?: InputMaybe<Array<_SearchPersonFields>>;
  query?: InputMaybe<Scalars['String']>;
};

export type QueryAggregateRoomArgs = {
  after?: InputMaybe<Scalars['String']>;
  fields?: InputMaybe<Array<_SearchRoomFields>>;
  filter?: InputMaybe<_SearchRoomFilter>;
  groupBy?: InputMaybe<Array<_SearchRoomFields>>;
  query?: InputMaybe<Scalars['String']>;
};

export type QueryAggregateTeamArgs = {
  after?: InputMaybe<Scalars['String']>;
  fields?: InputMaybe<Array<_SearchTeamFields>>;
  filter?: InputMaybe<_SearchTeamFilter>;
  groupBy?: InputMaybe<Array<_SearchTeamFields>>;
  query?: InputMaybe<Scalars['String']>;
};

export type QueryListBuildingArgs = {
  after?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<_ListBuildingFilter>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Array<_BuildingSort>>;
};

export type QueryListEquipmentArgs = {
  after?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<_ListEquipmentFilter>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Array<_EquipmentSort>>;
};

export type QueryListPersonArgs = {
  after?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<_ListPersonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Array<_PersonSort>>;
};

export type QueryListRoomArgs = {
  after?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<_ListRoomFilter>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Array<_RoomSort>>;
};

export type QueryListTeamArgs = {
  after?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<_ListTeamFilter>;
  first?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Array<_TeamSort>>;
};

export type QuerySearchBuildingArgs = {
  fields?: InputMaybe<Array<_SearchBuildingFields>>;
  filter?: InputMaybe<_SearchBuildingFilter>;
  first?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};

export type QuerySearchEquipmentArgs = {
  fields?: InputMaybe<Array<_SearchEquipmentFields>>;
  filter?: InputMaybe<_SearchEquipmentFilter>;
  first?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};

export type QuerySearchPersonArgs = {
  fields?: InputMaybe<Array<_SearchPersonFields>>;
  filter?: InputMaybe<_SearchPersonFilter>;
  first?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};

export type QuerySearchRoomArgs = {
  fields?: InputMaybe<Array<_SearchRoomFields>>;
  filter?: InputMaybe<_SearchRoomFilter>;
  first?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};

export type QuerySearchTeamArgs = {
  fields?: InputMaybe<Array<_SearchTeamFields>>;
  filter?: InputMaybe<_SearchTeamFilter>;
  first?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};

export type Room = {
  building?: Maybe<Building>;
  description?: Maybe<Scalars['String']>;
  externalId: Scalars['ID'];
  isBookable?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  nodeId?: Maybe<Scalars['Int64']>;
  type?: Maybe<Scalars['String']>;
};

export type RoomAggregateConnection = {
  edges: Array<Maybe<_RoomAggregateEdge>>;
  items: Array<Maybe<RoomAggregateResult>>;
  pageInfo: PageInfo;
};

export type RoomAggregateResult = {
  avg?: Maybe<_RoomAggregateFieldResult>;
  count?: Maybe<_RoomAggregateFieldCountResult>;
  group?: Maybe<Scalars['JSONObject']>;
  histogram?: Maybe<_RoomAggregateHistogramFieldResult>;
  max?: Maybe<_RoomAggregateFieldResult>;
  min?: Maybe<_RoomAggregateFieldResult>;
  sum?: Maybe<_RoomAggregateFieldResult>;
};

export type RoomAggregateResultHistogramArgs = {
  interval: Scalars['Int'];
};

export type RoomConnection = {
  edges: Array<Maybe<_RoomEdge>>;
  items: Array<Maybe<Room>>;
  pageInfo: PageInfo;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type Team = {
  externalId: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};

export type TeamAggregateConnection = {
  edges: Array<Maybe<_TeamAggregateEdge>>;
  items: Array<Maybe<TeamAggregateResult>>;
  pageInfo: PageInfo;
};

export type TeamAggregateResult = {
  avg?: Maybe<_TeamAggregateFieldResult>;
  count?: Maybe<_TeamAggregateFieldCountResult>;
  group?: Maybe<Scalars['JSONObject']>;
  histogram?: Maybe<_TeamAggregateHistogramFieldResult>;
  max?: Maybe<_TeamAggregateFieldResult>;
  min?: Maybe<_TeamAggregateFieldResult>;
  sum?: Maybe<_TeamAggregateFieldResult>;
};

export type TeamAggregateResultHistogramArgs = {
  interval: Scalars['Int'];
};

export type TeamConnection = {
  edges: Array<Maybe<_TeamEdge>>;
  items: Array<Maybe<Team>>;
  pageInfo: PageInfo;
};

export type TimeSeries = {
  assetId?: Maybe<Scalars['Int64']>;
  dataPoints?: Maybe<Array<Maybe<DataPoint>>>;
  datasetId?: Maybe<Scalars['Int64']>;
  description?: Maybe<Scalars['String']>;
  externalId?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int64']>;
  isStep?: Maybe<Scalars['Boolean']>;
  isString?: Maybe<Scalars['Boolean']>;
  metadata?: Maybe<Scalars['JSONObject']>;
  name?: Maybe<Scalars['String']>;
  securityCategories?: Maybe<Array<Maybe<Scalars['Int64']>>>;
  unit?: Maybe<Scalars['String']>;
};

export type TimeSeriesDataPointsArgs = {
  end?: InputMaybe<Scalars['Int64']>;
  limit?: InputMaybe<Scalars['Int']>;
  start?: InputMaybe<Scalars['Int64']>;
};

export type _AggregateHistogramObjectType = {
  count?: Maybe<Scalars['Int']>;
  start?: Maybe<Scalars['Int']>;
};

export type _BooleanCondition = {
  eq?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Scalars['Boolean']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
};

export type _BuildingAggregateEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: BuildingAggregateResult;
};

export type _BuildingAggregateFieldCountResult = {
  description?: Maybe<Scalars['Int']>;
  externalId?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['Int']>;
  nodeId?: Maybe<Scalars['Int']>;
  thumbnail?: Maybe<Scalars['Int']>;
};

export type _BuildingAggregateFieldResult = {
  nodeId?: Maybe<Scalars['Float']>;
};

export type _BuildingAggregateHistogramFieldResult = {
  nodeId?: Maybe<Array<Maybe<_AggregateHistogramObjectType>>>;
};

export type _BuildingEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: Building;
};

export type _BuildingSort = {
  description?: InputMaybe<SortDirection>;
  externalId?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  nodeId?: InputMaybe<SortDirection>;
  thumbnail?: InputMaybe<SortDirection>;
};

export type _EquipmentAggregateEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: EquipmentAggregateResult;
};

export type _EquipmentAggregateFieldCountResult = {
  externalId?: Maybe<Scalars['Int']>;
  isBroken?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['Int']>;
  nodeId?: Maybe<Scalars['Int']>;
  person?: Maybe<Scalars['Int']>;
  room?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['Int']>;
};

export type _EquipmentAggregateFieldResult = {
  nodeId?: Maybe<Scalars['Float']>;
};

export type _EquipmentAggregateHistogramFieldResult = {
  nodeId?: Maybe<Array<Maybe<_AggregateHistogramObjectType>>>;
};

export type _EquipmentEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: Equipment;
};

export type _EquipmentSort = {
  externalId?: InputMaybe<SortDirection>;
  isBroken?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  nodeId?: InputMaybe<SortDirection>;
  type?: InputMaybe<SortDirection>;
};

export type _FloatCondition = {
  eq?: InputMaybe<Scalars['Float']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  in?: InputMaybe<Array<Scalars['Float']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
};

export type _IdCondition = {
  eq?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
};

export type _Int64Condition = {
  eq?: InputMaybe<Scalars['Int64']>;
  gt?: InputMaybe<Scalars['Int64']>;
  gte?: InputMaybe<Scalars['Int64']>;
  in?: InputMaybe<Array<Scalars['Int64']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['Int64']>;
  lte?: InputMaybe<Scalars['Int64']>;
};

export type _IntCondition = {
  eq?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
};

export type _ListBuildingFilter = {
  and?: InputMaybe<Array<_ListBuildingFilter>>;
  description?: InputMaybe<_StringCondition>;
  externalId?: InputMaybe<_IdCondition>;
  name?: InputMaybe<_StringCondition>;
  nodeId?: InputMaybe<_Int64Condition>;
  not?: InputMaybe<_ListBuildingFilter>;
  or?: InputMaybe<Array<_ListBuildingFilter>>;
  thumbnail?: InputMaybe<_StringCondition>;
};

export type _ListEquipmentFilter = {
  and?: InputMaybe<Array<_ListEquipmentFilter>>;
  externalId?: InputMaybe<_IdCondition>;
  isBroken?: InputMaybe<_BooleanCondition>;
  name?: InputMaybe<_StringCondition>;
  nodeId?: InputMaybe<_Int64Condition>;
  not?: InputMaybe<_ListEquipmentFilter>;
  or?: InputMaybe<Array<_ListEquipmentFilter>>;
  person?: InputMaybe<_ListPersonFilter>;
  room?: InputMaybe<_ListRoomFilter>;
  type?: InputMaybe<_StringCondition>;
};

export type _ListPersonFilter = {
  and?: InputMaybe<Array<_ListPersonFilter>>;
  desk?: InputMaybe<_ListEquipmentFilter>;
  externalId?: InputMaybe<_IdCondition>;
  name?: InputMaybe<_StringCondition>;
  not?: InputMaybe<_ListPersonFilter>;
  or?: InputMaybe<Array<_ListPersonFilter>>;
  slackId?: InputMaybe<_StringCondition>;
  team?: InputMaybe<_ListTeamFilter>;
};

export type _ListRoomFilter = {
  and?: InputMaybe<Array<_ListRoomFilter>>;
  building?: InputMaybe<_ListBuildingFilter>;
  description?: InputMaybe<_StringCondition>;
  externalId?: InputMaybe<_IdCondition>;
  isBookable?: InputMaybe<_BooleanCondition>;
  name?: InputMaybe<_StringCondition>;
  nodeId?: InputMaybe<_Int64Condition>;
  not?: InputMaybe<_ListRoomFilter>;
  or?: InputMaybe<Array<_ListRoomFilter>>;
  type?: InputMaybe<_StringCondition>;
};

export type _ListTeamFilter = {
  and?: InputMaybe<Array<_ListTeamFilter>>;
  externalId?: InputMaybe<_IdCondition>;
  name?: InputMaybe<_StringCondition>;
  not?: InputMaybe<_ListTeamFilter>;
  or?: InputMaybe<Array<_ListTeamFilter>>;
};

export type _PersonAggregateEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: PersonAggregateResult;
};

export type _PersonAggregateFieldCountResult = {
  desk?: Maybe<Scalars['Int']>;
  externalId?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['Int']>;
  slackId?: Maybe<Scalars['Int']>;
  team?: Maybe<Scalars['Int']>;
};

export type _PersonAggregateFieldResult = {
  _empty: Scalars['Int'];
};

export type _PersonAggregateHistogramFieldResult = {
  _empty?: Maybe<Array<Maybe<_AggregateHistogramObjectType>>>;
};

export type _PersonEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: Person;
};

export type _PersonSort = {
  externalId?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  slackId?: InputMaybe<SortDirection>;
};

export type _RoomAggregateEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: RoomAggregateResult;
};

export type _RoomAggregateFieldCountResult = {
  building?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['Int']>;
  externalId?: Maybe<Scalars['Int']>;
  isBookable?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['Int']>;
  nodeId?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['Int']>;
};

export type _RoomAggregateFieldResult = {
  nodeId?: Maybe<Scalars['Float']>;
};

export type _RoomAggregateHistogramFieldResult = {
  nodeId?: Maybe<Array<Maybe<_AggregateHistogramObjectType>>>;
};

export type _RoomEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: Room;
};

export type _RoomSort = {
  description?: InputMaybe<SortDirection>;
  externalId?: InputMaybe<SortDirection>;
  isBookable?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  nodeId?: InputMaybe<SortDirection>;
  type?: InputMaybe<SortDirection>;
};

export enum _SearchBuildingFields {
  Description = 'description',
  Name = 'name',
  NodeId = 'nodeId',
  Thumbnail = 'thumbnail',
}

export type _SearchBuildingFilter = {
  and?: InputMaybe<Array<_SearchBuildingFilter>>;
  description?: InputMaybe<_StringCondition>;
  externalId?: InputMaybe<_IdCondition>;
  name?: InputMaybe<_StringCondition>;
  nodeId?: InputMaybe<_Int64Condition>;
  not?: InputMaybe<_SearchBuildingFilter>;
  or?: InputMaybe<Array<_SearchBuildingFilter>>;
  thumbnail?: InputMaybe<_StringCondition>;
};

export enum _SearchEquipmentFields {
  IsBroken = 'isBroken',
  Name = 'name',
  NodeId = 'nodeId',
  Type = 'type',
}

export type _SearchEquipmentFilter = {
  and?: InputMaybe<Array<_SearchEquipmentFilter>>;
  externalId?: InputMaybe<_IdCondition>;
  isBroken?: InputMaybe<_BooleanCondition>;
  name?: InputMaybe<_StringCondition>;
  nodeId?: InputMaybe<_Int64Condition>;
  not?: InputMaybe<_SearchEquipmentFilter>;
  or?: InputMaybe<Array<_SearchEquipmentFilter>>;
  type?: InputMaybe<_StringCondition>;
};

export enum _SearchPersonFields {
  Name = 'name',
  SlackId = 'slackId',
}

export type _SearchPersonFilter = {
  and?: InputMaybe<Array<_SearchPersonFilter>>;
  externalId?: InputMaybe<_IdCondition>;
  name?: InputMaybe<_StringCondition>;
  not?: InputMaybe<_SearchPersonFilter>;
  or?: InputMaybe<Array<_SearchPersonFilter>>;
  slackId?: InputMaybe<_StringCondition>;
};

export enum _SearchRoomFields {
  Description = 'description',
  IsBookable = 'isBookable',
  Name = 'name',
  NodeId = 'nodeId',
  Type = 'type',
}

export type _SearchRoomFilter = {
  and?: InputMaybe<Array<_SearchRoomFilter>>;
  description?: InputMaybe<_StringCondition>;
  externalId?: InputMaybe<_IdCondition>;
  isBookable?: InputMaybe<_BooleanCondition>;
  name?: InputMaybe<_StringCondition>;
  nodeId?: InputMaybe<_Int64Condition>;
  not?: InputMaybe<_SearchRoomFilter>;
  or?: InputMaybe<Array<_SearchRoomFilter>>;
  type?: InputMaybe<_StringCondition>;
};

export enum _SearchTeamFields {
  Name = 'name',
}

export type _SearchTeamFilter = {
  and?: InputMaybe<Array<_SearchTeamFilter>>;
  externalId?: InputMaybe<_IdCondition>;
  name?: InputMaybe<_StringCondition>;
  not?: InputMaybe<_SearchTeamFilter>;
  or?: InputMaybe<Array<_SearchTeamFilter>>;
};

export type _StringCondition = {
  eq?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  prefix?: InputMaybe<Scalars['String']>;
};

export type _TeamAggregateEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: TeamAggregateResult;
};

export type _TeamAggregateFieldCountResult = {
  externalId?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['Int']>;
};

export type _TeamAggregateFieldResult = {
  _empty: Scalars['Int'];
};

export type _TeamAggregateHistogramFieldResult = {
  _empty?: Maybe<Array<Maybe<_AggregateHistogramObjectType>>>;
};

export type _TeamEdge = {
  cursor?: Maybe<Scalars['String']>;
  node: Team;
};

export type _TeamSort = {
  externalId?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
};

export type _TimestampCondition = {
  eq?: InputMaybe<Scalars['Timestamp']>;
  gt?: InputMaybe<Scalars['Timestamp']>;
  gte?: InputMaybe<Scalars['Timestamp']>;
  in?: InputMaybe<Array<Scalars['Timestamp']>>;
  isNull?: InputMaybe<Scalars['Boolean']>;
  lt?: InputMaybe<Scalars['Timestamp']>;
  lte?: InputMaybe<Scalars['Timestamp']>;
};

export type GetMapDataQueryVariables = Exact<{
  equipmentFilter?: InputMaybe<_ListEquipmentFilter>;
  roomFilter?: InputMaybe<_ListRoomFilter>;
}>;

export type GetMapDataQueryTypeGenerated = {
  equipment?: {
    items: Array<{
      externalId: string;
      name?: string | null;
      type?: string | null;
      nodeId?: any | null;
      person?: { externalId: string; name?: string | null } | null;
    } | null>;
  } | null;
  rooms?: {
    items: Array<{
      externalId: string;
      name?: string | null;
      nodeId?: any | null;
      description?: string | null;
      isBookable?: boolean | null;
      type?: string | null;
    } | null>;
  } | null;
};

export type GetSearchDataQueryVariables = Exact<{
  personFilter?: InputMaybe<_ListPersonFilter>;
  roomFilter?: InputMaybe<_ListRoomFilter>;
}>;

export type GetSearchDataQueryTypeGenerated = {
  people?: {
    items: Array<{
      externalId: string;
      name?: string | null;
      slackId?: string | null;
      desk?: { name?: string | null; externalId: string } | null;
    } | null>;
  } | null;
  rooms?: {
    items: Array<{
      externalId: string;
      name?: string | null;
      nodeId?: any | null;
      description?: string | null;
      isBookable?: boolean | null;
    } | null>;
  } | null;
};

export type ListPeopleWithNoEquipmentQueryVariables = Exact<{
  [key: string]: never;
}>;

export type ListPeopleWithNoEquipmentQueryTypeGenerated = {
  people?: {
    items: Array<{ externalId: string; name?: string | null } | null>;
  } | null;
};

export const GetMapDataDocument = `
    query getMapData($equipmentFilter: _ListEquipmentFilter, $roomFilter: _ListRoomFilter) {
  equipment: listEquipment(first: 15, filter: $equipmentFilter) {
    items {
      externalId
      name
      type
      nodeId
      person {
        externalId
        name
      }
    }
  }
  rooms: listRoom(first: 15, filter: $roomFilter) {
    items {
      externalId
      name
      nodeId
      description
      isBookable
      type
    }
  }
}
    `;
export const useGetMapDataQuery = <
  TData = GetMapDataQueryTypeGenerated,
  TError = unknown
>(
  variables?: GetMapDataQueryVariables,
  options?: UseQueryOptions<GetMapDataQueryTypeGenerated, TError, TData>
) =>
  useQuery<GetMapDataQueryTypeGenerated, TError, TData>(
    variables === undefined ? ['getMapData'] : ['getMapData', variables],
    graphqlFetcher<GetMapDataQueryTypeGenerated, GetMapDataQueryVariables>(
      GetMapDataDocument,
      variables
    ),
    options
  );

useGetMapDataQuery.getKey = (variables?: GetMapDataQueryVariables) =>
  variables === undefined ? ['getMapData'] : ['getMapData', variables];
export const GetSearchDataDocument = `
    query getSearchData($personFilter: _ListPersonFilter, $roomFilter: _ListRoomFilter) {
  people: listPerson(first: 15, filter: $personFilter) {
    items {
      externalId
      name
      slackId
      desk {
        name
        externalId
      }
    }
  }
  rooms: listRoom(first: 15, filter: $roomFilter) {
    items {
      externalId
      name
      nodeId
      description
      isBookable
    }
  }
}
    `;
export const useGetSearchDataQuery = <
  TData = GetSearchDataQueryTypeGenerated,
  TError = unknown
>(
  variables?: GetSearchDataQueryVariables,
  options?: UseQueryOptions<GetSearchDataQueryTypeGenerated, TError, TData>
) =>
  useQuery<GetSearchDataQueryTypeGenerated, TError, TData>(
    variables === undefined ? ['getSearchData'] : ['getSearchData', variables],
    graphqlFetcher<
      GetSearchDataQueryTypeGenerated,
      GetSearchDataQueryVariables
    >(GetSearchDataDocument, variables),
    options
  );

useGetSearchDataQuery.getKey = (variables?: GetSearchDataQueryVariables) =>
  variables === undefined ? ['getSearchData'] : ['getSearchData', variables];
export const ListPeopleWithNoEquipmentDocument = `
    query listPeopleWithNoEquipment {
  people: listPerson(filter: {desk: {externalId: {isNull: true}}}) {
    items {
      externalId
      name
    }
  }
}
    `;
export const useListPeopleWithNoEquipmentQuery = <
  TData = ListPeopleWithNoEquipmentQueryTypeGenerated,
  TError = unknown
>(
  variables?: ListPeopleWithNoEquipmentQueryVariables,
  options?: UseQueryOptions<
    ListPeopleWithNoEquipmentQueryTypeGenerated,
    TError,
    TData
  >
) =>
  useQuery<ListPeopleWithNoEquipmentQueryTypeGenerated, TError, TData>(
    variables === undefined
      ? ['listPeopleWithNoEquipment']
      : ['listPeopleWithNoEquipment', variables],
    graphqlFetcher<
      ListPeopleWithNoEquipmentQueryTypeGenerated,
      ListPeopleWithNoEquipmentQueryVariables
    >(ListPeopleWithNoEquipmentDocument, variables),
    options
  );

useListPeopleWithNoEquipmentQuery.getKey = (
  variables?: ListPeopleWithNoEquipmentQueryVariables
) =>
  variables === undefined
    ? ['listPeopleWithNoEquipment']
    : ['listPeopleWithNoEquipment', variables];
