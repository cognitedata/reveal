export default {
  initialSelectedColumnNames: [
    'name',
    'status_ok',
    'datatype',
    'connector',
    'author',
    'project',
    'report',
    'status',
    'source_project',
  ],
  filterableColumns: ['datatype', 'connector', 'project'],
  mandatoryColumns: ['datatype', 'name', 'report'],
  nonSortableColumns: ['status_ok'],
  ignoreColumns: [
    'cdf_metadata',
    'business_tags',
    'revision',
    'revisions',
    'status_ok',
  ],
  keyColumn: 'id',
  columnOrder: [
    'status_ok',
    'name',
    'connector',
    'datatype',
    'author',
    'project',
    'report',
    'actions',
  ],
  columnNameMapping: [
    {
      keyName: 'status_ok',
      value: '',
    },
    {
      keyName: 'created_time',
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
      value: 'Status active',
    },
  ],
};
