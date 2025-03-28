import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';
import { QualitySettings } from '../../../../components';

export function getQualitySettingsFromViewer(
  viewer: Cognite3DViewer<DataSourceType>
): QualitySettings {
  const settings: QualitySettings = {
    cadBudget: { ...viewer.cadBudget },
    pointCloudBudget: { ...viewer.pointCloudBudget },
    // This should be fetched from the viewer, but cannot for some unknown reason
    resolutionOptions: viewer.getResolutionOptions()
  };
  return settings;
}
