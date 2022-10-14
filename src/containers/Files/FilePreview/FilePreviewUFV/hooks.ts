import { useCallback, useMemo } from 'react';
import { Annotation } from '@cognite/unified-file-viewer';
import { CommonLegacyCogniteAnnotation } from './types';
import { useQuery } from 'react-query';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';

type useUnifiedFileViewerAnnotationsProps = {
  annotations: CommonLegacyCogniteAnnotation[];
  selectedIds: string[];
  hoverId: string | undefined;
  hoverable: boolean;
  onMouseEnter?: (annotation: Annotation) => void;
  onMouseLeave?: (annotation: Annotation) => void;
  onClick?: (annotation: Annotation) => Annotation;
  renderAnnotation: (
    annotation: CommonLegacyCogniteAnnotation,
    isSelected: boolean
  ) => Annotation;
};
export const useUnifiedFileViewerAnnotations = ({
  annotations,
  selectedIds,
  hoverable,
  hoverId,
  onClick = () => {},
  onMouseEnter = () => {},
  onMouseLeave = () => {},
  renderAnnotation,
}: useUnifiedFileViewerAnnotationsProps) => {
  const getHoverStyles = useCallback(
    (annotation: Annotation) => {
      if (hoverable) {
        const isOnHover = hoverId == annotation.id;
        return {
          ...annotation,
          style: {
            ...annotation.style,
            fill: isOnHover
              ? `${annotation.style.stroke}22`
              : `${annotation.style.fill || 'transparent'}`,
          },
        };
      }
      return annotation;
    },
    [hoverable, hoverId]
  );

  const ufvAnnotations = useMemo(() => {
    return annotations
      .map(cogniteAnnotation => {
        const isSelected = selectedIds.includes(String(cogniteAnnotation.id));
        const styledUFVAnnotation = renderAnnotation(
          cogniteAnnotation,
          isSelected
        );
        return styledUFVAnnotation;
      })
      .filter(annotation => annotation !== undefined)
      .map(annotation => getHoverStyles(annotation));
  }, [annotations, renderAnnotation, selectedIds, getHoverStyles]);

  const ufvAnnotationsWithEvents = useMemo(() => {
    return ufvAnnotations.map(ufvAnnotation => {
      return {
        ...ufvAnnotation,
        onClick: (e: Event, annotation: Annotation) => {
          e.cancelBubble = true;
          onClick(annotation);
        },
        onMouseOver: (e: Event, annotation: Annotation) => {
          e.cancelBubble = true;
          onMouseEnter(annotation);
        },
        onMouseOut: (e: Event, annotation: Annotation) => {
          e.cancelBubble = true;
          onMouseLeave(annotation);
        },
      };
    });
  }, [ufvAnnotations, onClick, onMouseEnter, onMouseLeave]);
  return ufvAnnotationsWithEvents;
};

export const useFileDownloadUrl = (fileId: number) => {
  const sdk = useSDK();

  const { data } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', fileId],
    () => sdk.files.getDownloadUrls([{ id: fileId }]).then(r => r[0]),
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  return data?.downloadUrl || '';
};
