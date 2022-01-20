import { DocumentPayload } from '@cognite/discover-api-types';

import { DocumentsFacets } from 'modules/documentSearch/types';
import { CategoryTypes } from 'modules/sidebar/types';

export interface FilterPayload {
  title: string;
  data: DocumentPayload[];
  category: CategoryTypes;
}

export type DateTabType = keyof Pick<
  DocumentsFacets,
  'lastcreated' | 'lastmodified'
>;

export type OpenStatus = {
  isOpen: boolean;
};
