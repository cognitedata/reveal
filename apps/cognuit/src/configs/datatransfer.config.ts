export default {
  initialSelectedColumnNames: [
    'source.grouping',
    'source.name',
    'source.author',
    'source.last_updated',
    'source.datatype',
    'target.name',
    'target.last_updated',
    'status',
  ],
  filterableColumns: ['status', 'author'],
  mandatoryColumns: ['status', 'source.datatype', 'source.name'],
  nonSortableColumns: ['status'],
  ignoreColumns: [
    'source.cdf_metadata',
    'source.business_tags',
    'source.revision',
    'source.revisions',
    'source.status_ok',
  ],
  keyColumn: 'id',
  columnOrder: [
    'status',
    'source.grouping',
    'source.name',
    'source.author',
    'source.last_updated',
    'source.datatype',
    'source.connector',
    'source.project',
    'source.actions',
    // Put every desired order above this line.
    '*',
    'detailViewButton',
  ],
  columnNameMapping: [
    {
      keyName: 'status',
      value: 'Report',
    },
    {
      keyName: 'detailViewButton',
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
      keyName: 'datatype',
      value: 'Business tag',
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
