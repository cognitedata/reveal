import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { AllIconTypes } from '@cognite/cogs.js';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsPersonDetection,
  ColorsTagDetection,
} from 'src/constants/Colors';
import { getRandomColor } from 'src/modules/Review/Components/AnnotationSettingsModal/AnnotationSettingsUtils';
import { LegacyAnnotationMetadata, LegacyAnnotationType } from './legacyTypes';

export const ModelTypeStyleMap = {
  [VisionDetectionModelType.OCR]: ColorsOCR,
  [VisionDetectionModelType.TagDetection]: ColorsTagDetection,
  [VisionDetectionModelType.ObjectDetection]: ColorsObjectDetection,
  [VisionDetectionModelType.GaugeReader]: ColorsObjectDetection, // gauge reader is regarded as object detection models
  [VisionDetectionModelType.CustomModel]: ColorsObjectDetection, // custom models are regarded as object detection models
};
export const ModelTypeIconMap: { [key: number]: string } = {
  [VisionDetectionModelType.OCR]: 'String',
  [VisionDetectionModelType.TagDetection]: 'Assets',
  [VisionDetectionModelType.ObjectDetection]: 'Scan',
  [VisionDetectionModelType.GaugeReader]: 'Scan',
  [VisionDetectionModelType.CustomModel]: 'Scan',
};
export const ModelTypeAnnotationTypeMap: {
  [key: number]: LegacyAnnotationType;
} = {
  [VisionDetectionModelType.OCR]: 'vision/ocr',
  [VisionDetectionModelType.TagDetection]: 'vision/tagdetection',
  [VisionDetectionModelType.ObjectDetection]: 'vision/objectdetection',
  [VisionDetectionModelType.GaugeReader]: 'vision/gaugereader',
  [VisionDetectionModelType.CustomModel]: 'vision/custommodel',
};

export class LegacyAnnotationUtils {
  public static lineWidth = 5;

  public static getModelId(fileId: string, modelType: number): string {
    return `${modelType}-${fileId}`;
  }

  public static getAnnotationColor(
    text: string,
    modelType: VisionDetectionModelType,
    data?: LegacyAnnotationMetadata
  ): string {
    if (data) {
      if (data.color) {
        return data.color;
      }
      if (data.keypoint) {
        return getRandomColor();
      }
    }
    if (text === 'person') {
      return ColorsPersonDetection.color;
    }
    return ModelTypeStyleMap[modelType].color;
  }

  public static getIconType = (annotation: {
    text: string;
    modelType: VisionDetectionModelType;
  }) => {
    return annotation.text === 'person'
      ? 'User'
      : (ModelTypeIconMap[annotation.modelType] as AllIconTypes);
  };
}
