export interface RelationshipsFilterInternal {
  labels?: string[];
}

export interface DetailViewRelatedResourcesData {
  externalId: string;
  relation: 'Source' | 'Target';
  relationshipLabels?: string[];
}

export type WithDetailViewData<T> = T & DetailViewRelatedResourcesData;
