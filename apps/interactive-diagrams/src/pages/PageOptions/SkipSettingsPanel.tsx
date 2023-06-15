import React, { useContext } from 'react';

import { AppStateContext } from '@interactive-diagrams-app/context';
import { SkipSettings } from '@interactive-diagrams-app/pages/PageOptions/components';
import {
  trackUsage,
  PNID_METRICS,
} from '@interactive-diagrams-app/utils/Metrics';

import { Body, Title, Switch } from '@cognite/cogs.js';

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
        value={skipSettings}
        onChange={(_e: any, nextState: boolean) => {
          trackUsage(PNID_METRICS.configPage.skipSettings, { skip: nextState });
          setSkipSettings(nextState);
        }}
        style={{ margin: '20px 0 0' }}
      />
    </SkipSettings>
  );
}
