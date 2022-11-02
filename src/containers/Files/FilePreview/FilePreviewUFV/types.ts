import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
} from '@cognite/annotations';

export interface ProposedCogniteAnnotation extends PendingCogniteAnnotation {
  id: string;
}
export type CommonLegacyCogniteAnnotation =
  | CogniteAnnotation
  | ProposedCogniteAnnotation;
