import { InternalId } from '@cognite/sdk/dist/src';
import { Dispatch, SetStateAction } from 'react';
import { Filter } from './api';

export type PipelineTableTypes =
  | 'id'
  | 'name'
  | 'description'
  | 'owner'
  | 'run';

export type ResourceTableProps = {
  query?: string | null;
  advancedFilter?: any;
  filter: Filter;
  selected: InternalId[];
  setSelected: Dispatch<SetStateAction<InternalId[]>>;
  allSources: boolean;
};
