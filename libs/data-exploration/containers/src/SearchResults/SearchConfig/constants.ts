import { SearchConfigColumnType } from '@data-exploration-lib/core';

export const commonColumns: SearchConfigColumnType[] = [
  { id: 'name_or_type', label: 'Name' },
  { id: 'description_or_content', label: 'Description / Content' },
  { id: 'external_id', label: 'External Id' },
  { id: 'id', label: 'ID' },
  { id: 'metadata', label: 'Metadata' },
];
