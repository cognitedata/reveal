import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsTagDetection,
} from 'src/constants/Colors';

export const AnnotationTypeIconMap: { [key: string]: string } = {
  [CDFAnnotationTypeEnum.ImagesTextRegion]: 'TextScan',
  [CDFAnnotationTypeEnum.ImagesAssetLink]: 'ResourceAssets',
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: 'Scan',
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: 'Scan',
  [CDFAnnotationTypeEnum.ImagesClassification]: 'Scan',
};

export const AnnotationTypeStyleMap = {
  [CDFAnnotationTypeEnum.ImagesTextRegion]: ColorsOCR,
  [CDFAnnotationTypeEnum.ImagesAssetLink]: ColorsTagDetection,
  [CDFAnnotationTypeEnum.ImagesObjectDetection]: ColorsObjectDetection,
  [CDFAnnotationTypeEnum.ImagesKeypointCollection]: ColorsObjectDetection, // keypoint collections are regarded as object detection models
  [CDFAnnotationTypeEnum.ImagesClassification]: ColorsObjectDetection, // custom models are regarded as object detection models
};

export const VisionModelTypeCDFAnnotationTypeMap: {
  [key: number]: CDFAnnotationTypeEnum;
} = {
  [VisionDetectionModelType.OCR]: CDFAnnotationTypeEnum.ImagesTextRegion,
  [VisionDetectionModelType.TagDetection]:
    CDFAnnotationTypeEnum.ImagesAssetLink,
  [VisionDetectionModelType.ObjectDetection]:
    CDFAnnotationTypeEnum.ImagesObjectDetection,
  [VisionDetectionModelType.GaugeReader]:
    CDFAnnotationTypeEnum.ImagesKeypointCollection,
  [VisionDetectionModelType.CustomModel]:
    CDFAnnotationTypeEnum.ImagesObjectDetection, // TODO: update this when classification is added
};
