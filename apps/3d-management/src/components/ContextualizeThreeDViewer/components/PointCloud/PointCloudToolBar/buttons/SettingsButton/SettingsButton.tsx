import { RevealToolbar } from '@cognite/reveal-react-components';

import {
  HIGH_QUALITY_SETTINGS,
  LOW_QUALITY_SETTINGS,
} from '../../../../../../../pages/ContextualizeEditor/constants';

import { ColorTypeSelector } from './PointCloudColorPicker';
import { PointSizeSlider } from './PointSizeSlider';

export const SettingsButton = () => {
  return (
    <RevealToolbar.SettingsButton
      customSettingsContent={
        <>
          <ColorTypeSelector />
          <PointSizeSlider />
        </>
      }
      lowQualitySettings={LOW_QUALITY_SETTINGS}
      highQualitySettings={HIGH_QUALITY_SETTINGS}
    />
  );
};
