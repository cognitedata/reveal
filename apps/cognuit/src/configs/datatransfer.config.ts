export default {
  initialSelectedColumnNames: [
    'status',
    'source.datatype',
    'source.grouping',
    'source.name',
    'source.author',
    'source.last_updated',
    'target.name',
    'target.last_updated',
  ],
  filterableColumns: ['status', 'author'],
  mandatoryColumns: ['status', 'source.datatype', 'source.name'],
  nonSortableColumns: ['status'],
  ignoreColumns: [
    'source.cdf_metadata',
    'source.revisions',
    'source.status_ok',
    'source.origin',
    'source.package',
    'source.source_object_id',
    'target.cdf_metadata',
    'target.revisions',
    'target.status_ok',
    'target.origin',
    'target.package',
    'target.source_object_id',
    'target.source_created_time',
    'target.source_last_updated',
    'target.author',
    'target.grouping',
    'target.business_tags',
    'target.data_status',
  ],
  keyColumn: 'id',
  columnOrder: [
    'status',
    'source.datatype',
    'source.grouping',
    'source.name',
    'source.author',
    'source.last_updated',
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
      value: 'Created time (Cognuit)',
    },
    {
      keyName: 'connector',
      value: 'Connector',
    },
    {
      keyName: 'last_updated',
      value: 'Last updated (Cognuit)',
    },
    {
      keyName: 'datatype',
      value: 'Datatype',
    },
    {
      keyName: 'external_id',
      value: 'External ID',
    },
    {
      keyName: 'source_created_time',
      value: 'Created time (source system)',
    },
    {
      keyName: 'source_last_updated',
      value: 'Last updated (source system)',
    },
    {
      keyName: 'revisions_count',
      value: 'Revisions count',
    },
    {
      keyName: 'business_tags',
      value: 'Business tag',
    },
    {
      keyName: 'data_status',
      value: 'Status tag',
    },
    {
      keyName: 'crs',
      value: 'CRS',
    },
  ],
};
