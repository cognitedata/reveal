import { CanvasAnnotation, ContainerReference } from '../types';

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

type CommonFDMCanvasAnnotationProps =
  | 'id'
  | 'type'
  | 'containerId'
  | 'isSelectable'
  | 'isDraggable'
  | 'isResizable'
  | 'metadata';
export type FDMCanvasAnnotation = Pick<
  CanvasAnnotation,
  CommonFDMCanvasAnnotationProps
> & {
  externalId: string;
  properties: Omit<PickAll<CanvasAnnotation>, CommonFDMCanvasAnnotationProps>;
};

type CommonFDMContainerReferenceProps =
  | 'id'
  | 'type'
  | 'label'
  | 'width'
  | 'height'
  | 'maxWidth'
  | 'maxHeight'
  | 'x'
  | 'y';
export type FDMContainerReference = Pick<
  ContainerReference,
  CommonFDMContainerReferenceProps
> & {
  externalId: string;
  resourceId: number;
  resourceSubId?: number | null;
  properties: Omit<
    PickAll<ContainerReference>,
    CommonFDMContainerReferenceProps | 'resourceId' | 'resourceSubId'
  >;
};

export type FDMCanvasState = {
  canvasAnnotations: { items: FDMCanvasAnnotation[] } | null;
  containerReferences: { items: FDMContainerReference[] } | null;
};
