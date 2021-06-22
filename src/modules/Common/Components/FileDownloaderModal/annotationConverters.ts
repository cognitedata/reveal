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
