export default {
  visibleColumns: [
    'statusColor',
    'status_active',
    'conf_name',
    'last_updated',
    'last_updated',
    'author',
    'repoProject',
    'progress',
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
      keyName: 'business_tags',
      value: 'Business tags',
    },
    {
      keyName: 'data_status',
      value: 'Status tags',
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
