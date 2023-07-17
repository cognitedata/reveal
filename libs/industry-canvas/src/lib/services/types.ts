import { AnnotationType } from '@cognite/unified-file-viewer';

import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceType,
} from '../types';

// The type utilities below are stolen from https://stackoverflow.com/a/75113990

type KeyOf<Union, Otherwise = never> = Union extends Union
  ? keyof Union
  : Otherwise;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * @param Union - A discriminated union type to extract properties from.
 * @param Keys - The specific properties to extract from `Union`.
 * @defaultValue all `KeyOf<Union>`
 * @param Otherwise - The type to unionize with value types that don't exist in all members of `Union`.
 * @defaultValue `undefined`
 */
export type PickAll<
  Union,
  Keys extends KeyOf<Union> = KeyOf<Union>,
  Otherwise = undefined
> = {
  [_K in Keys]: Union extends { [K in _K]?: infer Value }
    ? UnionToIntersection<Value>
    : Otherwise;
};

type CommonDTOCanvasAnnotationProps =
  | 'id'
  | 'containerId'
  | 'isSelectable'
  | 'isDraggable'
  | 'isResizable'
  | 'metadata';
export type DTOCanvasAnnotation = Pick<
  CanvasAnnotation,
  CommonDTOCanvasAnnotationProps
> & {
  externalId: string;
  annotationType: AnnotationType;
  properties: Omit<PickAll<CanvasAnnotation>, CommonDTOCanvasAnnotationProps>;
};

type CommonDTOContainerReferenceProps =
  | 'id'
  | 'label'
  | 'width'
  | 'height'
  | 'maxWidth'
  | 'maxHeight'
  | 'x'
  | 'y';
export type DTOContainerReference = Pick<
  ContainerReference,
  CommonDTOContainerReferenceProps
> & {
  externalId: string;
  containerReferenceType: ContainerReferenceType;
  resourceId: number;
  resourceSubId?: number | null;
  properties: Omit<
    PickAll<ContainerReference>,
    CommonDTOContainerReferenceProps | 'resourceId' | 'resourceSubId'
  >;
};

export type DTOCanvasState = {
  canvasAnnotations: { items: DTOCanvasAnnotation[] } | null;
  containerReferences: { items: DTOContainerReference[] } | null;
};
