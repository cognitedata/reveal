export const CLASSIFIER_QUERY_KEYS = {
  list: 'classifier',
};

export const LABELS_QUERY_KEYS = {
  list: 'labels',
};

export const DOCUMENTS_QUERY_KEYS = {
  list: 'documents',
  byId: 'document',
  search: 'search',
  preview: 'preview',
  aggregates: 'aggregates',
  classifier: 'classifier',
  pipelines: 'pipelines',
  trainingSet: 'trainingSet',
};

export const DOCUMENTS_AGGREGATES = {
  labels: { name: 'LABEL', group: 'sourceFile.labels' },
  fileType: { name: 'FILE_TYPE', group: 'type' },
  documentType: { name: 'DOCUMENT_TYPE', group: 'labels' },
  source: { name: 'SOURCE', group: 'sourceFile.source' },
};
