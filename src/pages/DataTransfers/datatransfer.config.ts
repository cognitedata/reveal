export default {
  initialSelectedColumnNames: [
    'name',
    'status_ok',
    'datatype',
    'author',
    'project',
    'status',
    'source_project',
    'connector',
    'source',
  ],
  filterableColumns: ['datatype', 'connector', 'source', 'status', 'name'],
  ignoreColumns: ['cdf_metadata', 'business_tags'],
  keyColumn: 'id',
  columnOrder: [
    'status_ok',
    'name',
    'source',
    'datatype',
    'author',
    'project',
    'connector',
    'actions',
  ],
  columnNameMapping: [
    {
      keyName: 'status_ok',
      value: 'Status',
    },
    {
      keyName: 'created_time',
      value: 'Created time',
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
  ],
};
