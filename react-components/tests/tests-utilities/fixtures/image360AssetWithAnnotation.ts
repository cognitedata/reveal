import {
  type Image360AnnotationAssetQueryResult,
  type ClassicDataSourceType,
  type Image360Annotation,
  type Image360
} from '@cognite/reveal';
import { type AnnotationsTypesImagesAssetLink, type AnnotationModel } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { Vector3, Matrix4 } from 'three';
import { vi } from 'vitest';

const mockAnnotationData = new Mock<AnnotationsTypesImagesAssetLink>()
  .setup((p) => p.assetRef)
  .returns({ id: 1 })
  .object();

const mockAnnotationModel = new Mock<AnnotationModel>()
  .setup((p) => p.id)
  .returns(987)
  .setup((p) => p.data)
  .returns(mockAnnotationData)
  .object();

export const mockImage360AnnotationAssetResult = new Mock<
  Image360AnnotationAssetQueryResult<ClassicDataSourceType>
>()
  .setup((p) => p.annotation)
  .returns(
    new Mock<Image360Annotation<ClassicDataSourceType>>()
      .setup((q) => q.annotation)
      .returns(mockAnnotationModel)
      .setup((q) => q.getCenter)
      .returns(vi.fn(() => new Vector3(0, 0, 0)))
      .object()
  )
  .setup((p) => p.image)
  .returns(
    new Mock<Image360<ClassicDataSourceType>>()
      .setup((q) => q.transform)
      .returns(new Matrix4())
      .object()
  )
  .object();
