import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import {
  Button,
  Dropdown,
  Switch,
  Title,
  Menu,
  Body,
  toast,
  Input,
} from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';

import { useUpdateChart } from 'hooks/firebase';
import { trackUsage } from 'utils/metrics';

interface SharingDropdownProps {
  chart: Chart;
  disabled?: boolean;
}

const SharingDropdown = ({ chart, disabled = false }: SharingDropdownProps) => {
  const [shareIconType, setShareIconType] = useState<
    'Copy' | 'Checkmark' | 'ErrorStroked'
  >('Copy');
  const shareableLink = window.location.href;
  const { mutate: updateChart, isError } = useUpdateChart();

  useEffect(() => {
    if (isError) {
      toast.error('Unable to change chart access - try again!', {
        toastId: 'share-error',
      });
    }
  }, [isError]);

  const handleToggleChartAccess = async () => {
    updateChart({
      ...chart,
      public: !chart.public,
    });
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
      setShareIconType('ErrorStroked');
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
                ? 'This is a public chart. Copy the link to share it. Viewers will have to duplicate the chart in order to make changes.'
                : 'This is a private chart. It must be public to share it.'}
            </SharingMenuBody>
            <SharingSwitchContainer>
              <Switch
                name="toggleChartAccess"
                value={chart.public}
                onChange={handleToggleChartAccess}
              >
                {chart.public ? 'Sharing on' : 'Sharing off'}
              </Switch>
            </SharingSwitchContainer>
            <ShareLinkContainer>
              <Input
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
                Copy link
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

export const SharingMenu = styled(Menu)`
  min-width: 500px;
`;

export const SharingSwitchContainer = styled.div`
  margin: 16px 0 0 0;
`;

export const SharingMenuContent = styled.div`
  margin: 16px;
`;

export const SharingMenuBody = styled(Body)`
  margin: 8px 0 0;
  height: 40px;
`;

export const ShareLinkContainer = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 1em;
`;

const StyledDropdown = styled(Dropdown)`
  top: 0;
  position: absolute;
  right: 1px;
  transform: translate(50%);
`;

export default SharingDropdown;
