/*!
 * Copyright 2024 Cognite AS
 */

import { ChangedDescription } from '../../../base/domainObjectsHelpers/ChangedDescription';
import { type SingleAnnotation } from './SingleAnnotation';

export class AnnotationChangedDescription extends ChangedDescription {
  public annotation: SingleAnnotation;

  public constructor(change: symbol, annotation: SingleAnnotation) {
    super(change);
    this.annotation = annotation;
  }
}
