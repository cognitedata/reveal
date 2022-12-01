import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
} from '@cognite/annotations';

import { RectangleAnnotation } from '@cognite/unified-file-viewer';

export interface ProposedCogniteAnnotation extends PendingCogniteAnnotation {
  id: string;
}
export type CommonLegacyCogniteAnnotation =
  | CogniteAnnotation
  | ProposedCogniteAnnotation;

export enum SourceType {
  EVENTS = 'events',
  ANNOTATIONS = 'annotations',
}

type EventSource = {
  type: SourceType.EVENTS;
  eventId: number;
};

type AnnotationSource = {
  type: SourceType.ANNOTATIONS;
  annotationId: number;
};

type SpecificSource = EventSource | AnnotationSource;

type SpecificMetadata = {
  status?: CogniteAnnotation['status'];
  label?: string;
  description?: string;
  resourceType?: string;
  resourceExternalId?: string | undefined;
  resourceId?: number;
  page?: number;

  // ContextualizationModule
  score?: string;
  fromSimilarObject?: string;
  fromObjectDetection?: string;
  type?: string;
  originalBoxJson?: string;

  // Other
  color?: string;
  source?: SpecificSource;
};

// TODO(UFV-238) Metadata and ExtendedAnnotation are WIP types that will be exposed via unified-file-viewer
// once it's confirmed that they are fulfilling the desired need
export type Metadata<MetadataType> = MetadataType extends never
  ? {
      metadata?: never;
    }
  : {
      metadata: MetadataType;
    };
export type ExtendedAnnotation = Metadata<SpecificMetadata> &
  RectangleAnnotation;
