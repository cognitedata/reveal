/*!
 * Copyright 2024 Cognite AS
 */

import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ChangedDescription } from '../../base/domainObjectsHelpers/ChangedDescription';
import { type SingleAnnotation } from './helpers/SingleAnnotation';

export class AnnotationChangedDescription extends ChangedDescription {
  public annotation: SingleAnnotation;

  public constructor(annotation: SingleAnnotation) {
    super(Changes.geometryPart);
    this.annotation = annotation;
  }
}
