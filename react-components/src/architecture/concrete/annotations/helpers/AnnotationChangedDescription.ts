import { ChangedDescription } from '../../../base/domainObjectsHelpers/ChangedDescription';
import { type Annotation } from './Annotation';

export class AnnotationChangedDescription extends ChangedDescription {
  public annotation: Annotation;

  public constructor(change: symbol, annotation: Annotation) {
    super(change);
    this.annotation = annotation;
  }
}
