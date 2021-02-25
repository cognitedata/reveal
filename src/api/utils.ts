import { DetectionModelDataProvider, DetectionModelType } from 'src/api/types';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { OCRDetectionDataProvider } from 'src/api/ocr/OCRDetectionDataProvider';
import { MockDataProvider } from 'src/api/MockDataProvider';

// it's not strictly necessary to have that mapping, but it's just handy to have an overview in one place
export function getDetectionModelEndpoint(modelType: DetectionModelType) {
  const mapping: Record<DetectionModelType, string> = {
    [DetectionModelType.Text]: 'ocr',
    [DetectionModelType.Tag]: 'tagdetection',
    [DetectionModelType.GDPR]: 'objectdetection',
  };
  return `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/${mapping[modelType]}`;
}

export function getDetectionModelDataProvider(
  modelType: DetectionModelType
): DetectionModelDataProvider {
  switch (modelType) {
    case DetectionModelType.Text: {
      return new OCRDetectionDataProvider();
    }
    default: {
      // todo: implement other data providers and remove that default case and fake provider itself
      return new MockDataProvider();
    }
  }
}
