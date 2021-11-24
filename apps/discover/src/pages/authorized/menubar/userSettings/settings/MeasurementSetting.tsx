import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Body, SegmentedControl } from '@cognite/cogs.js';
import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { SettingsItem } from '../elements';

interface Props {
  onTabClick: (key: string, field: keyof UMSUserProfilePreferences) => void;
}
export const MeasurementSetting: React.FC<Props> = ({ onTabClick }) => {
  const { t } = useTranslation();
  const preferredMeasurement = useUserPreferencesMeasurement();

  return (
    <SettingsItem>
      <Body level={2}>{t('Measurement unit')}</Body>
      <SegmentedControl
        currentKey={preferredMeasurement}
        onButtonClicked={(key: string) => onTabClick(key, 'measurement')}
        fullWidth
      >
        <SegmentedControl.Button key="feet">Feet</SegmentedControl.Button>
        <SegmentedControl.Button key="meter">Meter</SegmentedControl.Button>
      </SegmentedControl>
    </SettingsItem>
  );
};
