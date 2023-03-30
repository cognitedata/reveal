import { Dispatch, SetStateAction } from 'react';

import { Filter, RawSource, RawTarget } from './api';

export type PipelineTableTypes =
  | 'id'
  | 'name'
  | 'description'
  | 'owner'
  | 'latestRun'
  | 'run';

type TablePropsBase = {
  query?: string | null;
  advancedFilter?: any;
  filter: Filter;
  allSources: boolean;
};

export type SourceTableProps = TablePropsBase & {
  selected: RawSource[];
  setSelected: Dispatch<SetStateAction<RawSource[]>>;
};

export type TargetTableProps = TablePropsBase & {
  selected: RawTarget[];
  setSelected: Dispatch<SetStateAction<RawTarget[]>>;
};

export type MatchType =
  | 'all'
  | 'previously-confirmed'
  | 'matched'
  | 'unmatched'
  | 'diff-matched';

export type MatchOptionType = {
  label: React.ReactNode;
  value: MatchType;
};
