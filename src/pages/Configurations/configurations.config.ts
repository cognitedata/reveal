export default {
  visibleColumns: [
    'statusColor',
    'status_active',
    'conf_name',
    'last_updated',
    'author',
    'repoProject',
    'actions',
  ],
  nonSortableColumns: ['statusColor', 'actions'],
  columnNameMapping: [
    {
      keyName: 'statusColor',
      value: '',
    },
    {
      keyName: 'repoProject',
      value: 'Repository/Project',
    },
    {
      keyName: 'status_actve',
      value: 'Created time',
    },
    {
      keyName: 'connector',
      value: 'Source',
    },
    {
      keyName: 'last_updated',
      value: 'Last updated',
    },
    {
      keyName: 'external_id',
      value: 'External ID',
    },
    {
      keyName: 'source_created_time',
      value: 'Source created time',
    },
    {
      keyName: 'source_last_updated',
      value: 'Source last updated',
    },
    {
      keyName: 'source_object_id',
      value: 'Source object ID',
    },
    {
      keyName: 'revisions_count',
      value: 'Revisions count',
    },
    {
      keyName: 'business_tags',
      value: 'Business tags',
    },
    {
      keyName: 'status_active',
      value: 'Status',
    },
    {
      keyName: 'conf_name',
      value: 'Name',
    },
  ],
};
