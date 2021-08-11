import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { AnnotationPreview } from '../../types';

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

  const unqiueAnnotations = Array.from(
    new Set(
      Object.entries(filteredAnnotations)
        .map(([_, items]) => {
          return items.map((item) => item.text.toLowerCase());
        })
        .flat()
    )
  );

  const categories = unqiueAnnotations.map((item, index) => {
    return {
      id: index,
      name: item,
      // supercategory: '', // TODO: should be conditional
      // color: '#ff0000', // TODO: should be conditional
      // keypoint_colors: [], // TODO: should be conditional
      // metadata: {},
    };
  });

  const images = filteredFiles.map((item, index) => {
    return {
      id: index,
      file_name: item.name,
      path: item.name, // TODO: should be directory
      // dataset_id: 1,
      // category_ids: [], // TODO: should be conditional
      // width: 0,
      // height: 0,
      // annotated: false,
      // annotating: [],
      // num_annotations: 0,
      // metadata: {},
      // deleted: false,
      // milliseconds: 0,
      // events: [],
      // regenerate_thumbnail: false,
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

        return {
          id: annotationId,
          image_id: filteredFiles.findIndex(
            (file) => file.id.toString() === key
          ),
          category_id: categories.findIndex(
            (category) => category.name === annotation.text.toLowerCase()
          ),
          bbox: isRectangle ? vertices : [0, 0, 0, 0],
          keypoints: isPoints ? vertices : [],
          num_keypoints: isPoints ? vertices.length : 0,
          segmentation: isPolygon ? [vertices] : [],
          // area: 0,
          // iscrowd: false,
          // isbbox: false,
          // color: '#ff0000', // TODO: should be conditional
          // metadata: {},
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
