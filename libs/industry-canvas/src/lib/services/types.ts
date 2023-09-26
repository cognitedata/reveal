import { AnnotationType } from '@cognite/unified-file-viewer';

import {
  AssetCentricContainerReference,
  CanvasAnnotation,
  ContainerReferenceType,
  FdmInstanceContainerReference,
  CanvasContext,
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

type ZIndex = { zIndex?: number };

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
  properties: ZIndex &
    Omit<PickAll<CanvasAnnotation>, CommonDTOCanvasAnnotationProps>;
};

type CommonDTOAssetCentricContainerReferenceProps =
  | 'id'
  | 'label'
  | 'width'
  | 'height'
  | 'maxWidth'
  | 'maxHeight'
  | 'x'
  | 'y';
export type DTOAssetCentricContainerReference = Pick<
  AssetCentricContainerReference,
  CommonDTOAssetCentricContainerReferenceProps
> & {
  externalId: string;
  containerReferenceType: ContainerReferenceType;
  resourceId: number;
  resourceSubId?: number | null;
  properties: ZIndex &
    Omit<
      PickAll<AssetCentricContainerReference>,
      | CommonDTOAssetCentricContainerReferenceProps
      | 'resourceId'
      | 'resourceSubId'
    >;
};

type CommonDTOFdmInstanceContainerReferenceProps =
  CommonDTOAssetCentricContainerReferenceProps;
export type DTOFdmInstanceContainerReference = Pick<
  FdmInstanceContainerReference,
  CommonDTOFdmInstanceContainerReferenceProps
> & {
  externalId: string;
  containerReferenceType: ContainerReferenceType;
  instanceExternalId: string;
  instanceSpace: string;
  viewExternalId: string;
  viewSpace: string;
  viewVersion?: string;
  properties: ZIndex &
    Omit<
      PickAll<FdmInstanceContainerReference>,
      | CommonDTOFdmInstanceContainerReferenceProps
      | 'instanceExternalId'
      | 'instanceSpace'
      | 'viewExternalId'
      | 'viewSpace'
      | 'viewVersion'
    >;
};

export type DTOCanvasState = {
  context: CanvasContext;
  canvasAnnotations: { items: DTOCanvasAnnotation[] } | null;
  containerReferences: { items: DTOAssetCentricContainerReference[] } | null;
  fdmInstanceContainerReferences: {
    items: DTOFdmInstanceContainerReference[];
  } | null;
};
