import { CogniteAnnotation } from '@cognite/annotations';
import { AnnotationPopover } from './AnnotationPopover';

export const Popover = ({ annotation }: { annotation: CogniteAnnotation }) => (
  <AnnotationPopover
    annotations={[annotation]}
    annotationTitle="Time series"
    fallbackText="Asset not found!"
  />
);
