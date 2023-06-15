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
  onSelectAll: (checked: boolean) => void;
};

export type SourceTableProps = TablePropsBase & {
  selected: RawSource[];
  onSelectRow: (row: RawSource, checked: boolean) => void;
};

export type TargetTableProps = TablePropsBase & {
  selected: RawTarget[];
  onSelectRow: (row: RawTarget, checked: boolean) => void;
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
