import {
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { annotationsKey } from '../keys';

export type AnnotatedResourceType = 'file';
export type LinkedResourceType = 'file' | 'asset';
export type AnnotationStatus = 'suggested' | 'approved' | 'rejected';
export type AnnotationType =
  | 'diagrams.AssetLink'
  | 'diagrams.FileLink'
  | 'diagrams.UnhandledTextObject'
  | 'diagrams.UnhandledSymbolObject'
  | 'diagrams.PipeSymbol'
  | 'diagrams.Line'
  | 'diagrams.Junction';

export type AnnotationBoundingBox = {
  confidence: number | null;
  xMax: number | null;
  xMin: number | null;
  yMax: number | null;
  yMin: number | null;
};

export type AnnotationPoint = {
  confidence: number | null;
  x: number | null;
  y: number | null;
};

export type AnnotationPolyLine = {
  vertices: AnnotationPoint[] | null;
};

export type AssetLinkDiagram = {
  annotationType: 'diagrams.AssetLink';
  data: {
    assetRef: {
      id: number | null;
      externalId: string | null;
    };
    pageNumber: number | null;
    symbol: string | null;
    symbolRegion: AnnotationBoundingBox | null;
    text: string | null;
    textRegion: AnnotationBoundingBox;
  };
};

export type FileLinkDiagram = {
  annotationType: 'diagrams.FileLink';
  data: {
    fileRef: {
      id: number | null;
      externalId: string | null;
    };
    pageNumber: number | null;
    symbol: string | null;
    symbolRegion: AnnotationBoundingBox | null;
    text: string | null;
    textRegion: AnnotationBoundingBox;
  };
};

export type UnhandledTextObjectDiagram = {
  annotationType: 'diagrams.UnhandledTextObject';
  data: {
    pageNumber: number | null;
    text: string;
    textRegion: AnnotationBoundingBox;
  };
};

export type UnhandledSymbolObjectDiagram = {
  annotationType: 'diagrams.UnhandledSymbolObject';
  data: {
    pageNumber: number | null;
    symbol: string;
    symbolRegion: AnnotationBoundingBox;
  };
};

export type PipeSymbolDiagram = {
  annotationType: 'diagrams.PipeSymbol';
  data: {
    pageNumber: number | null;
    polyline: AnnotationPolyLine;
  };
};

export type LineDiagram = {
  annotationType: 'diagrams.Line';
  data: {
    pageNumber: number | null;
    polyline: AnnotationPolyLine;
  };
};

export type JunctionDiagram = {
  annotationType: 'diagrams.Junction';
  data: {
    pageNumber: number | null;
    position: AnnotationPoint;
  };
};

export type AnnotationModel = {
  id: number;
  createdTime: Date;
  lastUpdatedTime: Date;
  annotatedResourceType: AnnotatedResourceType;
  annotatedResourceId?: number;
  annotatedResourceExternalId?: string;
  creatingApp: string;
  creatingAppVersion: string;
  creatingUser: string | null;
  linkedResourceType?: LinkedResourceType;
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  status: AnnotationStatus;
} & (
  | AssetLinkDiagram
  | FileLinkDiagram
  | UnhandledTextObjectDiagram
  | UnhandledSymbolObjectDiagram
  | PipeSymbolDiagram
  | LineDiagram
  | JunctionDiagram
);

export interface AnnotationFilterProps {
  annotatedResourceType: AnnotatedResourceType;
  annotatedResourceIds: IdEither[];
  annotationType?: AnnotationType;
  creatingApp?: string;
  creatingUser?: string | null;
  linkedResourceType?: LinkedResourceType;
  linkedResourceIds?: IdEither[];
  status?: AnnotationStatus;
}

export type AnnotationsData = { items: AnnotationModel[]; nextCursor?: string };

/**
 * ## Example
 * ```typescript
 * const { data, fetchNextPage, hasNextPage } = useAnnotations({
 *   annotatedResourceType: 'file',
 *   annotatedResourceIds: [{ id: 522578475963356 }],
 * });
 * ```
 */
export const useAnnotations = (
  filter: AnnotationFilterProps,
  limit: number = 25,
  options?: UseInfiniteQueryOptions<AnnotationsData>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<AnnotationsData>(
    annotationsKey(
      `${filter.annotatedResourceType}-${filter.annotatedResourceIds}`
    ),
    ({ pageParam }) =>
      sdk
        .post<AnnotationsData>(
          `api/playground/projects/${sdk.project}/annotations/list`,
          {
            data: {
              cursor: pageParam,
              limit,
              filter,
            },
          }
        )
        .then(({ data }) => {
          return {
            ...data,
            items: data?.items,
          };
        }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};
