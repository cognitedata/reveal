import { useState } from 'react';
import styled from 'styled-components/macro';
import {
  Button,
  Dropdown,
  Switch,
  Title,
  Menu,
  Body,
  Input,
} from '@cognite/cogs.js';
import { Chart } from 'models/chart/types';

import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { makeDefaultTranslations } from 'utils/translations';

interface SharingDropdownProps {
  chart: Chart;
  disabled?: boolean;
  translations?: typeof defaultTranslations;
}

const defaultTranslations = makeDefaultTranslations(
  'This is a public chart. Copy the link to share it. Viewers will have to duplicate the chart in order to make changes.',
  'This is a private chart. Make it public if you want to share it.',
  'Sharing on',
  'Sharing off',
  'Copy link'
);

const SharingDropdown = ({
  chart,
  disabled = false,
  translations,
}: SharingDropdownProps) => {
  const [, setChart] = useRecoilState(chartAtom);
  const [shareIconType, setShareIconType] = useState<
    'Copy' | 'Checkmark' | 'Error'
  >('Copy');
  const shareableLink = window.location.href;
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const handleToggleChartAccess = async () => {
    setChart((oldChart) => ({
      ...oldChart!,
      public: !oldChart?.public,
    }));

    trackUsage('ChartView.ChangeChartAccess', {
      state: chart.public ? 'public' : 'private',
    });
  };

  const handleCopyLinkClick = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setShareIconType('Checkmark');
      trackUsage('ChartView.CopyLink');
      setTimeout(() => setShareIconType('Copy'), 3000);
    } catch (e) {
      setShareIconType('Error');
      setTimeout(() => setShareIconType('Copy'), 3000);
    }
  };

  return (
    <StyledDropdown
      disabled={disabled}
      content={
        <SharingMenu>
          <SharingMenuContent>
            <Title level={3}>{chart.name}</Title>
            <SharingMenuBody level={1}>
              {chart.public
                ? t[
                    'This is a public chart. Copy the link to share it. Viewers will have to duplicate the chart in order to make changes.'
                  ]
                : t[
                    'This is a private chart. Make it public if you want to share it.'
                  ]}
            </SharingMenuBody>
            <SharingSwitchContainer>
              <Switch
                name="toggleChartAccess"
                value={chart.public}
                onChange={handleToggleChartAccess}
              >
                {chart.public ? t['Sharing on'] : t['Sharing off']}
              </Switch>
            </SharingSwitchContainer>
            <ShareLinkContainer>
              <ShareLink
                variant="default"
                value={shareableLink}
                disabled={!chart.public}
                htmlSize={32}
              />
              <Button
                type="primary"
                onClick={() => handleCopyLinkClick()}
                icon={shareIconType}
                iconPlacement="right"
                disabled={!chart.public}
              >
                {t['Copy link']}
              </Button>
            </ShareLinkContainer>
          </SharingMenuContent>
        </SharingMenu>
      }
    >
      <Button
        icon="Share"
        type="ghost"
        disabled={disabled}
        aria-label="share"
      />
    </StyledDropdown>
  );
};

const SharingMenu = styled(Menu)`
  min-width: 500px;
`;

const SharingSwitchContainer = styled.div`
  margin: 16px 0 0 0;
`;

const SharingMenuContent = styled.div`
  margin: 16px;
`;

const SharingMenuBody = styled(Body)`
  margin: 8px 0 0;
  min-height: 40px;
  white-space: normal;
`;

const ShareLinkContainer = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 1em;
`;

const ShareLink = styled(Input)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledDropdown = styled(Dropdown)`
  top: 0;
  position: absolute;
  right: 1px;
  transform: translate(50%);
`;

SharingDropdown.translationKeys = Object.keys(defaultTranslations);

export default SharingDropdown;
