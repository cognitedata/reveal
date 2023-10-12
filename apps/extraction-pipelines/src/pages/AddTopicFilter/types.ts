import { MQTTFormat } from '../../hooks/hostedExtractors';

export type CreateJobsFormDestinationOptionType =
  | 'use-existing'
  | 'current-user'
  | 'client-credentials';

export type CreateJobsFormValues = {
  topicFilters?: string[];
  destinationOption: CreateJobsFormDestinationOptionType;
  selectedDestinationExternalId?: string;
  destinationExternalIdToCreate?: string;
  clientId?: string;
  clientSecret?: string;
  format?: MQTTFormat['type'];
  mapping?: string;
  mappingName?: string;
};

export enum ExpandOptions {
  None = 0,
  TopicFilters,
  Format,
  Sync,
}
