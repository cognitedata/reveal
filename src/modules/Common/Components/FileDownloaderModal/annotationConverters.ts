import { FileInfo } from '@cognite/sdk';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { Status } from 'src/api/annotation/types';
import {
  isImageKeypointCollectionData,
  isImageObjectDetectionBoundingBoxData,
  isImageObjectDetectionPolygonData,
  isImageObjectDetectionPolylineData,
} from 'src/modules/Common/types/typeGuards';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';

export const convertAnnotationsToAutoML = async (
  files: FileInfo[],
  annotations: Record<number, VisionAnnotation<VisionAnnotationDataType>[]>,
  annotationStatus: Status[]
) => {
  // https://cloud.google.com/vision/automl/object-detection/docs/csv-format#csv
  const data = [] as any;

  files.forEach((file) => {
    annotations[file.id].forEach((annotation) => {
      if (
        annotationStatus.includes(annotation.status) &&
        isImageObjectDetectionBoundingBoxData(annotation)
      ) {
        data.push([
          file.name,
          annotation.label,
          annotation.boundingBox.xMin,
          annotation.boundingBox.yMin,
          annotation.boundingBox.xMax,
          annotation.boundingBox.yMax,
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
  annotations: Record<number, VisionAnnotation<VisionAnnotationDataType>[]>,
  annotationStatus: Status[]
) => {
  const filteredAnnotationsByFileMap: Record<
    number,
    VisionAnnotation<VisionAnnotationDataType>[]
  > = {};
  const filteredFiles: FileInfo[] = [];

  files.forEach((file) => {
    annotations[file.id].forEach((annotation) => {
      if (annotationStatus.includes(annotation.status)) {
        if (filteredAnnotationsByFileMap[file.id]) {
          filteredAnnotationsByFileMap[file.id]?.push(annotation);
        } else {
          filteredAnnotationsByFileMap[file.id] = [annotation];
        }
      }

      if (!filteredFiles.includes(file)) {
        filteredFiles.push(file);
      }
    });
  });

  const uniqueAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [];
  Object.entries(filteredAnnotationsByFileMap).filter(
    ([_, filteredAnnotationsForFile]) => {
      filteredAnnotationsForFile.forEach((annotation) => {
        const text = getAnnotationLabelOrText(annotation);
        const i = uniqueAnnotations.findIndex(
          (x) =>
            text.toLowerCase() === getAnnotationLabelOrText(x).toLowerCase()
        );
        if (i <= -1) {
          uniqueAnnotations.push(annotation);
        }
      });
      return null;
    }
  );

  const categories = uniqueAnnotations.map((item, index) => {
    const text = getAnnotationLabelOrText(item);
    const keypointLabels = isImageKeypointCollectionData(item)
      ? Object.keys(item.keypoints)
      : [];
    const colors: never[] = [];

    return {
      id: index,
      name: text,
      ...(keypointLabels.length && { keyPoints: keypointLabels }),
      ...(keypointLabels.length && { keypoint_colors: colors }),
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
  const content = Object.entries(filteredAnnotationsByFileMap)
    .map(([key, items]) => {
      return items.map((annotation) => {
        annotationId += 1;

        const isRectangle = isImageObjectDetectionBoundingBoxData(annotation);
        const isPolygon = isImageObjectDetectionPolygonData(annotation);
        const isPoints = isImageKeypointCollectionData(annotation);
        const isLine = isImageObjectDetectionPolylineData(annotation);

        let vertices: number[] = [];

        if (isImageObjectDetectionBoundingBoxData(annotation)) {
          vertices = [
            annotation.boundingBox.xMin,
            annotation.boundingBox.yMin,
            annotation.boundingBox.xMax,
            annotation.boundingBox.yMax,
          ];
        }
        if (isImageKeypointCollectionData(annotation)) {
          vertices = ([] as number[]).concat(
            ...Object.values(annotation.keypoints).map((keypoint) => [
              keypoint.point.x,
              keypoint.point.y,
            ])
          );
        }

        if (isImageObjectDetectionPolygonData(annotation)) {
          vertices = ([] as number[]).concat(
            ...annotation.polygon.vertices.map((vertex) => [vertex.x, vertex.y])
          );
        }

        if (isImageObjectDetectionPolylineData(annotation)) {
          vertices = ([] as number[]).concat(
            ...annotation.polyline.vertices.map((vertex) => [
              vertex.x,
              vertex.y,
            ])
          );
        }

        return {
          id: annotationId,
          image_id: filteredFiles.findIndex(
            (file) => file.id.toString() === key
          ),
          category_id: categories.findIndex(
            (category) =>
              category.name ===
              getAnnotationLabelOrText(annotation).toLowerCase()
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
