import { FileInfo } from '@cognite/sdk';
import { Vertex } from 'src/api/vision/detectionModels/types';
import { AnnotationPreview } from 'src/modules/Common/types';
import { Keypoint } from 'src/modules/Review/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';

export const convertAnnotationsToAutoML = async (
  files: FileInfo[],
  annotations: Record<number, AnnotationPreview[]>,
  annotationStatus: AnnotationStatus[]
) => {
  // https://cloud.google.com/vision/automl/object-detection/docs/csv-format#csv
  const data = [] as any;

  files.forEach((file) => {
    annotations[file.id].forEach((annotation) => {
      if (
        annotationStatus.includes(annotation.status) &&
        annotation.region?.shape === 'rectangle'
      ) {
        data.push([
          file.name,
          annotation.text,
          ...(annotation.region
            ? ([] as number[]).concat(
                ...annotation.region.vertices.map((vertex) => [
                  vertex.x,
                  vertex.y,
                ])
              )
            : []),
        ]);
      }
    });
  });

  // x_min,y_min,x_max,y_min,x_max,y_max,x_min,y_max
  data.forEach((item: any[]) => {
    item.push(item[2], item[5]);
    item.splice(4, 0, item[4], item[3]);
  });

  return [
    'annotations.csv',
    new Blob([data.map((e: any) => e.join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    }),
  ];
};

export const convertAnnotationsToCOCO = async (
  files: FileInfo[],
  annotations: Record<number, AnnotationPreview[]>,
  annotationStatus: AnnotationStatus[]
) => {
  const filteredAnnotations: Record<number, AnnotationPreview[]> = {};
  const filteredFiles: FileInfo[] = [];

  files.forEach((file) => {
    annotations[file.id].forEach((annotation) => {
      if (annotationStatus.includes(annotation.status)) {
        if (filteredAnnotations[file.id]) {
          filteredAnnotations[file.id]?.push(annotation);
        } else {
          filteredAnnotations[file.id] = [annotation];
        }
      }

      if (!filteredFiles.includes(file)) {
        filteredFiles.push(file);
      }
    });
  });

  const unqiueAnnotations = [] as AnnotationPreview[];
  Object.entries(filteredAnnotations).filter(([_, annotationPreviews]) => {
    annotationPreviews.forEach((annotation) => {
      const i = unqiueAnnotations.findIndex(
        (x) => annotation.text.toLowerCase() === x.text.toLowerCase()
      );
      if (i <= -1) {
        unqiueAnnotations.push(annotation);
      }
    });
    return null;
  });

  const categories = unqiueAnnotations.map((item, index) => {
    const extendedVertices = item.region?.vertices as (Vertex & Keypoint)[];
    const keyPoints = extendedVertices.map((v) =>
      v?.caption ? v.caption : null
    );
    const colors = extendedVertices.map((v) => (v?.color ? v.color : null));
    return {
      id: index,
      name: item.text,
      ...(!keyPoints.includes(null) && { keyPoints }),
      ...(!colors.includes(null) && { keypoint_colors: colors }),
    };
  });

  const images = filteredFiles.map((item, index) => {
    return {
      id: index,
      file_name: item.name,
      path: item.name, // TODO: should be directory
    };
  });

  let annotationId = 0;
  const content = Object.entries(filteredAnnotations)
    .map(([key, items]) => {
      return items.map((annotation) => {
        const vertices: number[] = annotation.region
          ? ([] as number[]).concat(
              ...annotation.region.vertices.map((vertex) => [
                vertex.x,
                vertex.y,
              ])
            )
          : [];
        annotationId += 1;
        const isRectangle = annotation.region?.shape === 'rectangle';
        const isPolygon = annotation.region?.shape === 'polygon';
        const isPoints = annotation.region?.shape === 'points';
        const isLine = annotation.region?.shape === 'polyline';

        return {
          id: annotationId,
          image_id: filteredFiles.findIndex(
            (file) => file.id.toString() === key
          ),
          category_id: categories.findIndex(
            (category) => category.name === annotation.text.toLowerCase()
          ),
          ...(isRectangle && { bbox: vertices }),
          ...(isPoints && { keypoints: vertices }),
          ...(isPoints && { num_keypoints: vertices.length / 2 }), // each keypoint consist of (x, y)
          ...(isPolygon && { segmentation: [vertices] }),
          ...(isLine && { polyline: [vertices] }),
        };
      });
    })
    .flat();

  const data = JSON.stringify({
    images,
    categories,
    annotations: content,
  });

  return ['annotations.json', new Blob([data], { type: 'application/json' })];
};
