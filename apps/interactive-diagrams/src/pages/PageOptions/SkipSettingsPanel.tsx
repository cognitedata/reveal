import React, { useContext } from 'react';
import { Body, Title, Switch } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { AppStateContext } from 'context';
import { SkipSettings } from 'pages/PageOptions/components';

export default function SkipSettingsPanel() {
  const { skipSettings, setSkipSettings } = useContext(AppStateContext);

  const onSkipSettingsChange = (skip: boolean) => {
    trackUsage(PNID_METRICS.configPage.skipSettings, { skip });
    setSkipSettings(skip);
  };

  return (
    <SkipSettings>
      <Title level={5}>Save and skip settings</Title>
      <Body level={2}>
        Do you want to always apply the same settings and skip this step? (You
        can change this setting later.)
      </Body>
      <Switch
        name="skipSettingsOption"
        value={skipSettings}
        onChange={onSkipSettingsChange}
        style={{ margin: '20px 0 0 -8px' }}
      />
    </SkipSettings>
  );
}
