/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel, AnnotationStatus } from '@cognite/sdk';
import { Image360AnnotationFilterOptions } from './types';
import isArray from 'lodash/isArray';

export class Image360AnnotationFilter {
  private readonly _annotationFilter: Required<Image360AnnotationFilterOptions>;

  private fillDefaultAnnotationOptionValues(
    annotationOptions?: Image360AnnotationFilterOptions
  ): Required<Image360AnnotationFilterOptions> {
    const result: Required<Image360AnnotationFilterOptions> = {
      status: annotationOptions?.status ?? 'approved'
    };
    return result;
  }

  constructor(options: Image360AnnotationFilterOptions) {
    this._annotationFilter = this.fillDefaultAnnotationOptionValues(options);
  }

  private filterStatus(annotation: AnnotationModel): boolean {
    if (this._annotationFilter.status === 'all') {
      return true;
    } else if (isArray(this._annotationFilter.status)) {
      return this._annotationFilter.status.indexOf(annotation.status as AnnotationStatus) !== -1;
    } else {
      return this._annotationFilter.status === annotation.status;
    }
  }

  filter(annotation: AnnotationModel): boolean {
    return this.filterStatus(annotation);
  }
}
