export const LABELS_KEYS = {
  all: ['labels'],
  labels: () => [...LABELS_KEYS.all, 'label'],
} as const;

export const DOCUMENTS_KEYS = {
  all: ['documents'],
  documents: (externalId?: string) =>
    [...DOCUMENTS_KEYS.all, 'document', externalId && ['label', externalId]]
      .filter(Boolean)
      .flat(1),
  document: (id?: number | string) => [...DOCUMENTS_KEYS.documents(), id],
  previews: () => [...DOCUMENTS_KEYS.all, 'preview'],
  preview: (id?: number) => [...DOCUMENTS_KEYS.previews(), id],
  searches: () => [...DOCUMENTS_KEYS.all, 'search'],
} as const;

export const PIPELINES_KEYS = {
  all: ['pipelines'],
  pipelines: () => [...PIPELINES_KEYS.all, 'pipeline'],
} as const;

export const CLASSIFIER_KEYS = {
  all: ['classifiers'],
  classifiers: () => [...CLASSIFIER_KEYS.all, 'classifier'],
  classifier: (id?: number) => [...CLASSIFIER_KEYS.classifiers(), id],
  activeClassifier: () => [...CLASSIFIER_KEYS.all, 'active'],
  trainingSets: () => [...CLASSIFIER_KEYS.all, 'trainingSet'],
} as const;

export const AGGREGATES_KEYS = {
  all: ['aggregates'],
  aggregates: () => [...AGGREGATES_KEYS.all, 'aggregate'],
} as const;

export const DOCUMENTS_AGGREGATES = {
  labels: { name: 'LABELS', group: 'labels' },
  fileType: { name: 'FILE_TYPE', group: 'type' },
  source: { name: 'SOURCE', group: 'sourceFile.source' },
};
