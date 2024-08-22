/*!
 * Copyright 2024 Cognite AS
 */

import { type PointCloudAnnotation } from './types';

import { type Status } from '../AnnotationsView';
import { compareAnnotationIdentifiers } from './compareAnnotationIdentifiers';

export class WireframeUserData {
  public selected: boolean;
  public status: Status;
  public annotations: PointCloudAnnotation[] = []; // Pending annotation has empty array

  public constructor(status: Status, selected: boolean) {
    this.status = status;
    this.selected = selected;
  }

  public get length(): number {
    return this.annotations.length;
  }

  public get isPending(): boolean {
    return this.length === 0;
  }

  public contain(annotation: PointCloudAnnotation): boolean {
    return this.annotations.some((a) => compareAnnotationIdentifiers(a, annotation));
  }

  public add(annotation: PointCloudAnnotation): void {
    this.annotations.push(annotation);
  }
}
