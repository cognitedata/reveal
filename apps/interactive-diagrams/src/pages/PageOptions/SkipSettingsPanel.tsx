import React, { useContext } from 'react';

import { Body, Title, Switch } from '@cognite/cogs.js';

import { AppStateContext } from '../../context';
import { trackUsage, PNID_METRICS } from '../../utils/Metrics';

import { SkipSettings } from './components';

export default function SkipSettingsPanel() {
  const { skipSettings, setSkipSettings } = useContext(AppStateContext);

  return (
    <SkipSettings>
      <Title level={5}>Save and skip settings</Title>
      <Body level={2}>
        Do you want to always apply the same settings and skip this step? (You
        can change this setting later.)
      </Body>
      <Switch
        name="skipSettingsOption"
        checked={skipSettings}
        onChange={(_e, nextState) => {
          trackUsage(PNID_METRICS.configPage.skipSettings, { skip: nextState });
          setSkipSettings(!!nextState);
        }}
        style={{ margin: '20px 0 0' }}
      />
    </SkipSettings>
  );
}
