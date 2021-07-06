import React from 'react';
import { Body, Title, Switch } from '@cognite/cogs.js';
import { SkipSettings } from 'pages/PageOptions/components';

type Props = {
  shouldSkipSettings: boolean;
  onSkipSettingsChange: (skipSettings: boolean) => void;
};

export default function SkipSettingsPanel(props: Props) {
  const { shouldSkipSettings, onSkipSettingsChange } = props;

  return (
    <SkipSettings>
      <Title level={5}>Save and skip settings</Title>
      <Body level={2}>
        Do you want to always apply the same settings and skip this step? (You
        can change this setting later.)
      </Body>
      <Switch
        name="skipSettingsOption"
        value={shouldSkipSettings ?? false}
        onChange={onSkipSettingsChange}
        style={{ margin: '20px 0 0 -8px' }}
      />
    </SkipSettings>
  );
}
